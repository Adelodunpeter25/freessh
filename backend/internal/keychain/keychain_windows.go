// +build windows

package keychain

import (
	"fmt"
	"syscall"
	"unsafe"
)

type windowsKeychain struct{}

var (
	advapi32           = syscall.NewLazyDLL("advapi32.dll")
	credWrite          = advapi32.NewProc("CredWriteW")
	credRead           = advapi32.NewProc("CredReadW")
	credDelete         = advapi32.NewProc("CredDeleteW")
	credFree           = advapi32.NewProc("CredFree")
)

const (
	CRED_TYPE_GENERIC = 1
	CRED_PERSIST_LOCAL_MACHINE = 2
)

type credential struct {
	Flags              uint32
	Type               uint32
	TargetName         *uint16
	Comment            *uint16
	LastWritten        syscall.Filetime
	CredentialBlobSize uint32
	CredentialBlob     *byte
	Persist            uint32
	AttributeCount     uint32
	Attributes         uintptr
	TargetAlias        *uint16
	UserName           *uint16
}

func newPlatformKeychain() Keychain {
	return &windowsKeychain{}
}

func (k *windowsKeychain) Set(service, account, password string) error {
	targetName, _ := syscall.UTF16PtrFromString(service + ":" + account)
	userName, _ := syscall.UTF16PtrFromString(account)
	pwdBytes := []byte(password)
	
	cred := &credential{
		Type:               CRED_TYPE_GENERIC,
		TargetName:         targetName,
		CredentialBlobSize: uint32(len(pwdBytes)),
		CredentialBlob:     &pwdBytes[0],
		Persist:            CRED_PERSIST_LOCAL_MACHINE,
		UserName:           userName,
	}
	
	ret, _, err := credWrite.Call(uintptr(unsafe.Pointer(cred)), 0)
	if ret == 0 {
		return fmt.Errorf("failed to store password: %v", err)
	}
	return nil
}

func (k *windowsKeychain) Get(service, account string) (string, error) {
	targetName, _ := syscall.UTF16PtrFromString(service + ":" + account)
	var cred *credential
	
	ret, _, err := credRead.Call(
		uintptr(unsafe.Pointer(targetName)),
		CRED_TYPE_GENERIC,
		0,
		uintptr(unsafe.Pointer(&cred)),
	)
	
	if ret == 0 {
		return "", fmt.Errorf("password not found: %v", err)
	}
	defer credFree.Call(uintptr(unsafe.Pointer(cred)))
	
	pwdBytes := make([]byte, cred.CredentialBlobSize)
	for i := range pwdBytes {
		pwdBytes[i] = *(*byte)(unsafe.Pointer(uintptr(unsafe.Pointer(cred.CredentialBlob)) + uintptr(i)))
	}
	
	return string(pwdBytes), nil
}

func (k *windowsKeychain) Delete(service, account string) error {
	targetName, _ := syscall.UTF16PtrFromString(service + ":" + account)
	
	ret, _, err := credDelete.Call(
		uintptr(unsafe.Pointer(targetName)),
		CRED_TYPE_GENERIC,
		0,
	)
	
	if ret == 0 {
		return fmt.Errorf("failed to delete password: %v", err)
	}
	return nil
}
