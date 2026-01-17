export interface TunnelConfig {
  local_port: number
  remote_host: string
  remote_port: number
}

export interface TunnelInfo {
  id: string
  local_port: number
  remote_host: string
  remote_port: number
  status: 'active' | 'stopped' | 'error'
  error?: string
}
