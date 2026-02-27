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
	// A single SSH session can only run one command; detect in one shell invocation.
	output, err := session.Output("sh -c 'uname -s 2>/dev/null; cat /etc/os-release 2>/dev/null || cat /etc/lsb-release 2>/dev/null'")
	if err != nil {
		return Unknown, err
	}

	lines := strings.SplitN(string(output), "\n", 2)
	osName := strings.TrimSpace(strings.ToLower(lines[0]))
	var distroContent string
	if len(lines) > 1 {
		distroContent = strings.ToLower(lines[1])
	}

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

	// For Linux, detect specific distro from os-release content.
	distro := detectLinuxDistro(distroContent)
	if distro == Unknown {
		return Linux, nil
	}

	return distro, nil
}

func detectLinuxDistro(content string) OSType {
	content = strings.ToLower(content)
	if strings.TrimSpace(content) == "" {
		return Unknown
	}

	// Check for specific distros
	switch {
	case strings.Contains(content, "ubuntu"):
		return Ubuntu
	case strings.Contains(content, "debian"):
		return Debian
	case strings.Contains(content, "arch"):
		return Arch
	case strings.Contains(content, "fedora"):
		return Fedora
	case strings.Contains(content, "centos"):
		return CentOS
	case strings.Contains(content, "rhel") || strings.Contains(content, "red hat"):
		return RedHat
	}

	return Unknown
}
