package osdetect

import (
	"strings"

	"golang.org/x/crypto/ssh"
)

type OSType string

const (
	Ubuntu  OSType = "ubuntu"
	Debian  OSType = "debian"
	RedHat  OSType = "redhat"
	CentOS  OSType = "centos"
	Fedora  OSType = "fedora"
	Arch    OSType = "arch"
	Linux   OSType = "linux"
	MacOS   OSType = "macos"
	FreeBSD OSType = "freebsd"
	Windows OSType = "windows"
	Unknown OSType = "unknown"
)

// DetectOS runs commands over SSH to detect the remote operating system
func DetectOS(session *ssh.Session) (OSType, error) {
	// First check basic OS type
	output, err := session.Output("uname -s")
	if err != nil {
		return Unknown, err
	}

	osName := strings.TrimSpace(strings.ToLower(string(output)))

	// Handle non-Linux systems
	switch {
	case strings.Contains(osName, "darwin"):
		return MacOS, nil
	case strings.Contains(osName, "freebsd"):
		return FreeBSD, nil
	case strings.Contains(osName, "windows"), strings.Contains(osName, "mingw"), strings.Contains(osName, "cygwin"):
		return Windows, nil
	case !strings.Contains(osName, "linux"):
		return Unknown, nil
	}

	// For Linux, detect specific distro
	distro, err := detectLinuxDistro(session)
	if err != nil || distro == Unknown {
		return Linux, nil
	}

	return distro, nil
}

func detectLinuxDistro(session *ssh.Session) (OSType, error) {
	// Try /etc/os-release first (most modern distros)
	output, err := session.Output("cat /etc/os-release 2>/dev/null || cat /etc/lsb-release 2>/dev/null")
	if err != nil {
		return Unknown, err
	}

	content := strings.ToLower(string(output))

	// Check for specific distros
	switch {
	case strings.Contains(content, "ubuntu"):
		return Ubuntu, nil
	case strings.Contains(content, "debian"):
		return Debian, nil
	case strings.Contains(content, "arch"):
		return Arch, nil
	case strings.Contains(content, "fedora"):
		return Fedora, nil
	case strings.Contains(content, "centos"):
		return CentOS, nil
	case strings.Contains(content, "rhel") || strings.Contains(content, "red hat"):
		return RedHat, nil
	}

	return Unknown, nil
}
