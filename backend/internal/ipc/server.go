package ipc

import (
	"fmt"
	"freessh-backend/internal/config"
	"freessh-backend/internal/ipc/handlers"
	"freessh-backend/internal/ipc/handlers/keys"
	"freessh-backend/internal/ipc/handlers/sftp"
	"freessh-backend/internal/models"
	"freessh-backend/internal/session"
	"freessh-backend/internal/settings"
	"freessh-backend/internal/storage"
	"freessh-backend/internal/workspace"
	"log"
)

type Server struct {
	reader          *Reader
	writer          *Writer
	handlers        []handlers.Handler
	terminalHandler *handlers.TerminalHandler
}

type requestScopedWriter struct {
	base      *Writer
	requestID string
}

func (w *requestScopedWriter) WriteMessage(msg *models.IPCMessage) error {
	if msg == nil {
		return nil
	}

	if msg.RequestID == "" {
		msg.RequestID = w.requestID
	}

	return w.base.WriteMessage(msg)
}

func (w *requestScopedWriter) WriteError(sessionID string, err error) error {
	return w.WriteMessage(&models.IPCMessage{
		Type:      models.MsgError,
		SessionID: sessionID,
		Data:      map[string]string{"error": err.Error()},
	})
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
	workspaceManager := workspace.NewManager(config.FeatureDetachableWorkspaces)
	workspaceStateStore, err := workspace.NewStateStore()
	if err != nil {
		log.Printf("Warning: Failed to initialize workspace state storage: %v", err)
	} else {
		workspaceManager.SetStateStore(workspaceStateStore)
		if _, loadErr := workspaceManager.LoadPersistedState(); loadErr != nil && loadErr != workspace.ErrStateNotFound {
			log.Printf("Warning: Failed to restore workspace state: %v", loadErr)
		}
	}
	terminalHandler := handlers.NewTerminalHandler(manager, historyStorage)

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
			handlers.NewRemoteHandler(manager),
			handlers.NewPortForwardHandler(manager),
			handlers.NewLazyHandler(
				[]models.MessageType{
					models.MsgPortForwardConfigList,
					models.MsgPortForwardConfigGet,
					models.MsgPortForwardConfigCreate,
					models.MsgPortForwardConfigUpdate,
					models.MsgPortForwardConfigDelete,
				},
				func() (handlers.Handler, error) {
					portForwardStorage, storageErr := storage.NewPortForwardStorage()
					if storageErr != nil {
						return nil, fmt.Errorf("failed to initialize port forward storage: %w", storageErr)
					}
					return handlers.NewPortForwardConfigHandler(portForwardStorage), nil
				},
			),
			handlers.NewKeychainHandler(),
			handlers.NewKeygenHandler(),
			keys.NewHandler(manager),
			handlers.NewLazyHandler(
				[]models.MessageType{
					models.MsgKnownHostList,
					models.MsgKnownHostRemove,
					models.MsgKnownHostTrust,
					models.MsgKnownHostImport,
				},
				func() (handlers.Handler, error) {
					knownHostStorage, storageErr := storage.NewKnownHostStorage()
					if storageErr != nil {
						return nil, fmt.Errorf("failed to initialize known hosts storage: %w", storageErr)
					}
					return handlers.NewKnownHostsHandler(knownHostStorage), nil
				},
			),
			handlers.NewLazyHandler(
				[]models.MessageType{
					models.MsgGroupList,
					models.MsgGroupCreate,
					models.MsgGroupRename,
					models.MsgGroupDelete,
				},
				func() (handlers.Handler, error) {
					groupStorage, storageErr := storage.NewGroupStorage()
					if storageErr != nil {
						return nil, fmt.Errorf("failed to initialize group storage: %w", storageErr)
					}
					return handlers.NewGroupHandler(groupStorage, manager.GetConnectionStorage()), nil
				},
			),
			handlers.NewLogHandler(),
			handlers.NewLogSettingsHandler(logSettingsStorage),
			handlers.NewLazyHandler(
				[]models.MessageType{
					models.MsgSnippetList,
					models.MsgSnippetCreate,
					models.MsgSnippetUpdate,
					models.MsgSnippetDelete,
				},
				func() (handlers.Handler, error) {
					snippetStorage, storageErr := storage.NewSnippetStorage()
					if storageErr != nil {
						return nil, fmt.Errorf("failed to initialize snippet storage: %w", storageErr)
					}
					return handlers.NewSnippetHandler(snippetStorage), nil
				},
			),
			handlers.NewHistoryHandler(historyStorage),
			handlers.NewLazyHandler(
				[]models.MessageType{models.MsgExportFreeSSH},
				func() (handlers.Handler, error) {
					groupStorage, groupErr := storage.NewGroupStorage()
					if groupErr != nil {
						return nil, fmt.Errorf("failed to initialize group storage: %w", groupErr)
					}
					portForwardStorage, portErr := storage.NewPortForwardStorage()
					if portErr != nil {
						return nil, fmt.Errorf("failed to initialize port forward storage: %w", portErr)
					}
					return handlers.NewExportFreeSSHHandler(manager.GetConnectionStorage(), groupStorage, portForwardStorage), nil
				},
			),
			handlers.NewLazyHandler(
				[]models.MessageType{models.MsgImportFreeSSH},
				func() (handlers.Handler, error) {
					groupStorage, groupErr := storage.NewGroupStorage()
					if groupErr != nil {
						return nil, fmt.Errorf("failed to initialize group storage: %w", groupErr)
					}
					portForwardStorage, portErr := storage.NewPortForwardStorage()
					if portErr != nil {
						return nil, fmt.Errorf("failed to initialize port forward storage: %w", portErr)
					}
					return handlers.NewImportFreeSSHHandler(manager.GetConnectionStorage(), groupStorage, portForwardStorage), nil
				},
			),
			handlers.NewLazyHandler(
				[]models.MessageType{models.MsgExportOpenSSH},
				func() (handlers.Handler, error) {
					groupStorage, groupErr := storage.NewGroupStorage()
					if groupErr != nil {
						return nil, fmt.Errorf("failed to initialize group storage: %w", groupErr)
					}
					portForwardStorage, portErr := storage.NewPortForwardStorage()
					if portErr != nil {
						return nil, fmt.Errorf("failed to initialize port forward storage: %w", portErr)
					}
					return handlers.NewExportOpenSSHHandler(manager.GetConnectionStorage(), groupStorage, portForwardStorage), nil
				},
			),
			handlers.NewLazyHandler(
				[]models.MessageType{models.MsgImportOpenSSH},
				func() (handlers.Handler, error) {
					groupStorage, groupErr := storage.NewGroupStorage()
					if groupErr != nil {
						return nil, fmt.Errorf("failed to initialize group storage: %w", groupErr)
					}
					portForwardStorage, portErr := storage.NewPortForwardStorage()
					if portErr != nil {
						return nil, fmt.Errorf("failed to initialize port forward storage: %w", portErr)
					}
					return handlers.NewImportOpenSSHHandler(manager.GetConnectionStorage(), groupStorage, portForwardStorage), nil
				},
			),
			handlers.NewWorkspaceHandler(workspaceManager),
			handlers.NewWorkspacePersistenceHandler(workspaceManager),
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

		// Preserve strict input ordering for terminal keystrokes/history capture.
		if msg.Type == models.MsgInput || msg.Type == models.MsgResize || msg.Type == models.MsgTerminalStartLogging || msg.Type == models.MsgTerminalStopLogging {
			s.handleMessage(msg)
			continue
		}

		go s.handleMessage(msg)
	}
}

func (s *Server) handleMessage(msg *models.IPCMessage) {
	writer := &requestScopedWriter{
		base:      s.writer,
		requestID: msg.RequestID,
	}

	for _, handler := range s.handlers {
		if handler.CanHandle(msg.Type) {
			if err := handler.Handle(msg, writer); err != nil {
				writer.WriteError(msg.SessionID, err)
				return
			}

			// Start terminal output streaming after successful connection
			if (msg.Type == models.MsgConnect || msg.Type == models.MsgConnectionConnect) && msg.SessionID != "" {
				s.terminalHandler.StartOutputStreaming(msg.SessionID, s.writer)
			}

			return
		}
	}

	writer.WriteError("", fmt.Errorf("no handler for message type: %s", msg.Type))
}
