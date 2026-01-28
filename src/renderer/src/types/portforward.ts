export interface TunnelConfig {
  local_port: number
  remote_host: string
  remote_port: number
}

export interface RemoteTunnelConfig {
  remote_port: number
  local_host: string
  local_port: number
}

export interface TunnelInfo {
  id: string
  type: 'local' | 'remote'
  local_port: number
  remote_host: string
  remote_port: number
  status: 'active' | 'stopped' | 'error'
  error?: string
}

export interface CreateTunnelRequest {
  type: 'local' | 'remote'
  config?: TunnelConfig
  remote?: RemoteTunnelConfig
}
