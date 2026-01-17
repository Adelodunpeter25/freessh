package ipc

import (
	"fmt"
	"freessh-backend/internal/ipc/handlers"
	"freessh-backend/internal/models"
	"freessh-backend/internal/session"
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
	
	return &Server{
		reader:          NewReader(),
		writer:          NewWriter(),
		terminalHandler: terminalHandler,
		handlers: []handlers.Handler{
			handlers.NewSSHHandler(manager),
			terminalHandler,
			handlers.NewSessionHandler(manager),
			handlers.NewConnectionHandler(manager),
			handlers.NewSFTPHandler(manager),
			handlers.NewPortForwardHandler(manager),
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
