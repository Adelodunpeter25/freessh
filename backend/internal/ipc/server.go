package ipc

import (
	"fmt"
	"freessh-backend/internal/ipc/handlers"
	"freessh-backend/internal/models"
	"freessh-backend/internal/session"
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
	manager := session.NewManager()
	terminalHandler := handlers.NewTerminalHandler(manager)
	
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
	
	// Create shared verification helper
	verificationHelper := handlers.NewHostKeyVerificationHelper()
	
	return &Server{
		reader:          NewReader(),
		writer:          NewWriter(),
		terminalHandler: terminalHandler,
		handlers: []handlers.Handler{
			handlers.NewSSHHandler(manager, verificationHelper),
			terminalHandler,
			handlers.NewSessionHandler(manager),
			handlers.NewConnectionHandler(manager, verificationHelper),
			handlers.NewSFTPHandler(manager),
			handlers.NewPortForwardHandler(manager),
			handlers.NewPortForwardConfigHandler(portForwardStorage),
			handlers.NewKeychainHandler(),
			handlers.NewKeygenHandler(),
			handlers.NewKeysHandler(manager),
			handlers.NewKnownHostsHandler(knownHostStorage),
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
