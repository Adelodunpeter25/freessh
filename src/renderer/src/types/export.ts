export interface ExportFreeSSHResponse {
  data: any
  filename: string
}

export interface ExportOpenSSHResponse {
  data: string
  filename: string
}

export interface ImportFreeSSHRequest {
  data: Uint8Array
}

export interface ImportFreeSSHResponse {
  connections_imported: number
  groups_imported: number
  port_forwards_imported: number
  errors?: string[]
}

export interface ImportOpenSSHRequest {
  data: Uint8Array
}

export interface ImportOpenSSHResponse {
  connections_imported: number
  keys_imported: number
  errors?: string[]
}
