package osdetect

import (
	"strings"

	"golang.org/x/crypto/ssh"
)

type OSType string

const (
	Linux   OSType = "linux"
	MacOS   OSType = "macos"
	FreeBSD OSType = "freebsd"
	Windows OSType = "windows"
	Unknown OSType = "unknown"
)

// DetectOS runs a command over SSH to detect the remote operating system
func DetectOS(session *ssh.Session) (OSType, error) {
	output, err := session.Output("uname -s")
	if err != nil {
		return Unknown, err
	}

	osName := strings.TrimSpace(strings.ToLower(string(output)))

	switch {
	case strings.Contains(osName, "linux"):
		return Linux, nil
	case strings.Contains(osName, "darwin"):
		return MacOS, nil
	case strings.Contains(osName, "freebsd"):
		return FreeBSD, nil
	case strings.Contains(osName, "windows"), strings.Contains(osName, "mingw"), strings.Contains(osName, "cygwin"):
		return Windows, nil
	default:
		return Unknown, nil
	}
}
