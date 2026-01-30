package models

type ExportRequest struct {
	Format string `json:"format"` // "freessh"
}

type ExportResponse struct {
	Data     []byte `json:"data"`
	Filename string `json:"filename"`
}

type ImportRequest struct {
	Format string `json:"format"` // "freessh"
	Data   []byte `json:"data"`
}

type ImportResponse struct {
	ConnectionsImported  int      `json:"connections_imported"`
	GroupsImported       int      `json:"groups_imported"`
	PortForwardsImported int      `json:"port_forwards_imported"`
	Errors               []string `json:"errors,omitempty"`
}
