package dynamic

import (
	"encoding/binary"
	"fmt"
	"io"
	"net"
)

const (
	socks5Version = 0x05
	noAuth        = 0x00
	connectCmd    = 0x01
	ipv4Address   = 0x01
	domainName    = 0x03
	ipv6Address   = 0x04
)

func handleSOCKS5(clientConn net.Conn, dialFunc func(network, addr string) (net.Conn, error)) error {
	defer clientConn.Close()

	// Read version and auth methods
	buf := make([]byte, 2)
	if _, err := io.ReadFull(clientConn, buf); err != nil {
		return err
	}

	version, nMethods := buf[0], buf[1]
	if version != socks5Version {
		return fmt.Errorf("unsupported SOCKS version: %d", version)
	}

	// Read auth methods
	methods := make([]byte, nMethods)
	if _, err := io.ReadFull(clientConn, methods); err != nil {
		return err
	}

	// Respond with no auth required
	if _, err := clientConn.Write([]byte{socks5Version, noAuth}); err != nil {
		return err
	}

	// Read request
	buf = make([]byte, 4)
	if _, err := io.ReadFull(clientConn, buf); err != nil {
		return err
	}

	if buf[0] != socks5Version {
		return fmt.Errorf("invalid SOCKS version in request")
	}

	cmd := buf[1]
	if cmd != connectCmd {
		// Send command not supported
		clientConn.Write([]byte{socks5Version, 0x07, 0x00, ipv4Address, 0, 0, 0, 0, 0, 0})
		return fmt.Errorf("unsupported command: %d", cmd)
	}

	// Parse address
	addrType := buf[3]
	var addr string

	switch addrType {
	case ipv4Address:
		ipBuf := make([]byte, 4)
		if _, err := io.ReadFull(clientConn, ipBuf); err != nil {
			return err
		}
		addr = net.IP(ipBuf).String()

	case domainName:
		lenBuf := make([]byte, 1)
		if _, err := io.ReadFull(clientConn, lenBuf); err != nil {
			return err
		}
		domainBuf := make([]byte, lenBuf[0])
		if _, err := io.ReadFull(clientConn, domainBuf); err != nil {
			return err
		}
		addr = string(domainBuf)

	case ipv6Address:
		ipBuf := make([]byte, 16)
		if _, err := io.ReadFull(clientConn, ipBuf); err != nil {
			return err
		}
		addr = net.IP(ipBuf).String()

	default:
		clientConn.Write([]byte{socks5Version, 0x08, 0x00, ipv4Address, 0, 0, 0, 0, 0, 0})
		return fmt.Errorf("unsupported address type: %d", addrType)
	}

	// Read port
	portBuf := make([]byte, 2)
	if _, err := io.ReadFull(clientConn, portBuf); err != nil {
		return err
	}
	port := binary.BigEndian.Uint16(portBuf)

	// Connect to target through SSH
	target := fmt.Sprintf("%s:%d", addr, port)
	remoteConn, err := dialFunc("tcp", target)
	if err != nil {
		// Send connection refused
		clientConn.Write([]byte{socks5Version, 0x05, 0x00, ipv4Address, 0, 0, 0, 0, 0, 0})
		return err
	}
	defer remoteConn.Close()

	// Send success response
	if _, err := clientConn.Write([]byte{socks5Version, 0x00, 0x00, ipv4Address, 0, 0, 0, 0, 0, 0}); err != nil {
		return err
	}

	// Proxy data
	done := make(chan struct{}, 2)

	go func() {
		io.Copy(remoteConn, clientConn)
		done <- struct{}{}
	}()

	go func() {
		io.Copy(clientConn, remoteConn)
		done <- struct{}{}
	}()

	<-done
	return nil
}
