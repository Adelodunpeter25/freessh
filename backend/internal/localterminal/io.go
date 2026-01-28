package localterminal

import (
	"io"
	"os"
)

type IO struct {
	ptmx *os.File
}

func NewIO(ptmx *os.File) *IO {
	return &IO{
		ptmx: ptmx,
	}
}

func (io *IO) Write(data []byte) (int, error) {
	if io.ptmx == nil {
		return 0, io.ErrClosed()
	}
	return io.ptmx.Write(data)
}

func (io *IO) Read() io.Reader {
	return io.ptmx
}

func (io *IO) ErrClosed() error {
	return io.ptmx.Close()
}
