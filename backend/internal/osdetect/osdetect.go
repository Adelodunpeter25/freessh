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

// DetectOS runs commands over SSH to detect the remote operating system.
func DetectOS(client *ssh.Client) (OSType, error) {
	commands := []string{
		// Keep command successful on macOS where /etc/os-release is absent.
		"sh -lc 'uname -s 2>/dev/null; cat /etc/os-release 2>/dev/null || cat /etc/lsb-release 2>/dev/null || true'",
		// Windows fallbacks for OpenSSH-on-Windows hosts.
		"cmd /c ver",
		"powershell -NoProfile -Command \"$PSVersionTable.OS\"",
		"ver",
	}

	var lastErr error
	for _, cmd := range commands {
		output, err := runCommand(client, cmd)
		if err != nil {
			lastErr = err
		}
		detected := detectFromOutput(string(output))
		if detected != Unknown {
			return detected, nil
		}
	}

	if lastErr != nil {
		return Unknown, lastErr
	}

	return Unknown, nil
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

func runCommand(client *ssh.Client, command string) ([]byte, error) {
	session, err := client.NewSession()
	if err != nil {
		return nil, err
	}
	defer session.Close()
	return session.Output(command)
}

func detectFromOutput(output string) OSType {
	content := strings.ToLower(strings.TrimSpace(output))
	if content == "" {
		return Unknown
	}

	switch {
	case strings.Contains(content, "darwin"), strings.Contains(content, "macos"), strings.Contains(content, "mac os"):
		return MacOS
	case strings.Contains(content, "freebsd"):
		return FreeBSD
	case strings.Contains(content, "windows"), strings.Contains(content, "microsoft"), strings.Contains(content, "mingw"), strings.Contains(content, "cygwin"):
		return Windows
	}

	distro := detectLinuxDistro(content)
	if distro != Unknown {
		return distro
	}

	if strings.Contains(content, "linux") {
		return Linux
	}

	return Unknown
}
