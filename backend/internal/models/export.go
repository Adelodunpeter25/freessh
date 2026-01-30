package models

type ExportFreeSSHRequest struct {
	// No parameters needed - exports everything
}

type ExportFreeSSHResponse struct {
	Data     string `json:"data"`
	Filename string `json:"filename"`
}

type ImportFreeSSHRequest struct {
	Data []byte `json:"data"`
}

type ImportFreeSSHResponse struct {
	ConnectionsImported  int      `json:"connections_imported"`
	GroupsImported       int      `json:"groups_imported"`
	PortForwardsImported int      `json:"port_forwards_imported"`
	Errors               []string `json:"errors,omitempty"`
}
