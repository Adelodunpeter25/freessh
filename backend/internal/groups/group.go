package groups

import (
	"fmt"
	"freessh-backend/internal/models"
	"time"

	"github.com/google/uuid"
)

type Group struct {
	models.Group
}

func NewGroup(name string) (*Group, error) {
	if name == "" {
		return nil, fmt.Errorf("group name cannot be empty")
	}

	return &Group{
		Group: models.Group{
			ID:        uuid.New().String(),
			Name:      name,
			CreatedAt: time.Now(),
		},
	}, nil
}

func (g *Group) Rename(newName string) error {
	if newName == "" {
		return fmt.Errorf("group name cannot be empty")
	}
	g.Name = newName
	return nil
}
