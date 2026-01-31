package ipc

import (
	"fmt"
	"freessh-backend/internal/ipc/handlers"
	"freessh-backend/internal/ipc/handlers/keys"
	"freessh-backend/internal/ipc/handlers/sftp"
	"freessh-backend/internal/models"
	"freessh-backend/internal/session"
	"freessh-backend/internal/settings"
	"freessh-backend/internal/storage"
	"log"
)

type Server struct {
	reader          *Reader
	writer          *Writer
	handlers        []handlers.Handler
	terminalHandler *handlers.TerminalHandler
}

func NewServer() *Server {
	// Initialize log settings storage first
	logSettingsStorage, err := settings.NewLogSettingsStorage()
	if err != nil {
		log.Printf("Warning: Failed to initialize log settings storage: %v", err)
	}
	
	// Initialize history storage
	historyStorage, err := storage.NewHistoryStorage()
	if err != nil {
		log.Fatalf("Failed to initialize history storage: %v", err)
	}
	
	manager := session.NewManager(logSettingsStorage)
	terminalHandler := handlers.NewTerminalHandler(manager, historyStorage)
	
	// Initialize known hosts storage
	knownHostStorage, err := storage.NewKnownHostStorage()
	if err != nil {
		log.Printf("Warning: Failed to initialize known hosts storage: %v", err)
	}
	
	// Initialize port forward config storage
	portForwardStorage, err := storage.NewPortForwardStorage()
	if err != nil {
		log.Printf("Warning: Failed to initialize port forward storage: %v", err)
	}
	
	// Initialize group storage
	groupStorage, err := storage.NewGroupStorage()
	if err != nil {
		log.Printf("Warning: Failed to initialize group storage: %v", err)
	}
	
	// Initialize snippet storage
	snippetStorage, err := storage.NewSnippetStorage()
	if err != nil {
		log.Printf("Warning: Failed to initialize snippet storage: %v", err)
	}
	
	// Create shared verification helper
	verificationHelper := handlers.NewHostKeyVerificationHelper()
	
	return &Server{
		reader:          NewReader(),
		writer:          NewWriter(),
		terminalHandler: terminalHandler,
		handlers: []handlers.Handler{
			handlers.NewSSHHandler(manager, verificationHelper),
			terminalHandler,
			handlers.NewSessionHandler(manager, historyStorage),
			handlers.NewConnectionHandler(manager, verificationHelper),
			sftp.NewHandler(manager),
			handlers.NewBulkHandler(manager),
			handlers.NewPortForwardHandler(manager),
			handlers.NewPortForwardConfigHandler(portForwardStorage),
			handlers.NewKeychainHandler(),
			handlers.NewKeygenHandler(),
			keys.NewHandler(manager),
			handlers.NewKnownHostsHandler(knownHostStorage),
			handlers.NewGroupHandler(groupStorage, manager.GetConnectionStorage()),
			handlers.NewLogHandler(),
			handlers.NewLogSettingsHandler(logSettingsStorage),
			handlers.NewSnippetHandler(snippetStorage),
			handlers.NewHistoryHandler(historyStorage),
			handlers.NewExportFreeSSHHandler(manager.GetConnectionStorage(), groupStorage, portForwardStorage),
			handlers.NewImportFreeSSHHandler(manager.GetConnectionStorage(), groupStorage, portForwardStorage),
			handlers.NewExportOpenSSHHandler(manager.GetConnectionStorage(), groupStorage, portForwardStorage),
			handlers.NewImportOpenSSHHandler(manager.GetConnectionStorage(), groupStorage, portForwardStorage),
		},
	}
}

func (s *Server) Start() error {
	log.Println("IPC Server started")

	for {
		msg, err := s.reader.ReadMessage()
		if err != nil {
			log.Printf("Read error: %v", err)
			return err
		}

		go s.handleMessage(msg)
	}
}

func (s *Server) handleMessage(msg *models.IPCMessage) {
	for _, handler := range s.handlers {
		if handler.CanHandle(msg.Type) {
			if err := handler.Handle(msg, s.writer); err != nil {
				s.writer.WriteError(msg.SessionID, err)
				return
			}
			
			// Start terminal output streaming after successful connection
			if (msg.Type == models.MsgConnect || msg.Type == models.MsgConnectionConnect) && msg.SessionID != "" {
				s.terminalHandler.StartOutputStreaming(msg.SessionID, s.writer)
			}
			
			return
		}
	}

	s.writer.WriteError("", fmt.Errorf("no handler for message type: %s", msg.Type))
}
