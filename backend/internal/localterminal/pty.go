package localterminal

import (
	"fmt"
	"os"

	"github.com/creack/pty"
)

type PTY struct {
	ptmx *os.File
}

func NewPTY() *PTY {
	return &PTY{}
}

func (p *PTY) Start(rows, cols int) (*os.File, error) {
	if p.ptmx != nil {
		return p.ptmx, nil
	}
	return nil, fmt.Errorf("pty not initialized")
}

func (p *PTY) SetSize(rows, cols int) error {
	if p.ptmx == nil {
		return fmt.Errorf("pty not initialized")
	}

	return pty.Setsize(p.ptmx, &pty.Winsize{
		Rows: uint16(rows),
		Cols: uint16(cols),
	})
}

func (p *PTY) SetFile(file *os.File) {
	p.ptmx = file
}

func (p *PTY) Close() error {
	if p.ptmx != nil {
		return p.ptmx.Close()
	}
	return nil
}
