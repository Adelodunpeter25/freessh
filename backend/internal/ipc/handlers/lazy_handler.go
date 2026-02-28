package handlers

import (
	"fmt"
	"freessh-backend/internal/models"
	"sync"
)

type HandlerFactory func() (Handler, error)

type LazyHandler struct {
	msgTypes map[models.MessageType]struct{}
	factory  HandlerFactory

	once    sync.Once
	handler Handler
	initErr error
}

func NewLazyHandler(msgTypes []models.MessageType, factory HandlerFactory) *LazyHandler {
	index := make(map[models.MessageType]struct{}, len(msgTypes))
	for _, msgType := range msgTypes {
		index[msgType] = struct{}{}
	}

	return &LazyHandler{
		msgTypes: index,
		factory:  factory,
	}
}

func (h *LazyHandler) CanHandle(msgType models.MessageType) bool {
	_, ok := h.msgTypes[msgType]
	return ok
}

func (h *LazyHandler) Handle(msg *models.IPCMessage, writer ResponseWriter) error {
	h.once.Do(func() {
		if h.factory == nil {
			h.initErr = fmt.Errorf("lazy handler factory not configured")
			return
		}

		impl, err := h.factory()
		if err != nil {
			h.initErr = err
			return
		}
		h.handler = impl
	})

	if h.initErr != nil {
		return h.initErr
	}
	if h.handler == nil {
		return fmt.Errorf("lazy handler failed to initialize")
	}

	return h.handler.Handle(msg, writer)
}

