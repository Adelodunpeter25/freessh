export interface TunnelConfig {
  local_port: number
  remote_host: string
  remote_port: number
  binding_address: string
}

export interface RemoteTunnelConfig {
  remote_port: number
  local_host: string
  local_port: number
  binding_address: string
}

export interface DynamicTunnelConfig {
  local_port: number
  binding_address: string
}

export interface DynamicTunnelConfig {
  local_port: number
  binding_address: string
}

export interface TunnelInfo {
  id: string
  connection_id: string
  name: string
  type: 'local' | 'remote' | 'dynamic'
  local_port: number
  remote_host: string
  remote_port: number
  status: 'active' | 'stopped' | 'error'
  error?: string
}

export interface CreateTunnelRequest {
  type: 'local' | 'remote' | 'dynamic'
  connection_id: string
  name: string
  config?: TunnelConfig
  remote?: RemoteTunnelConfig
  dynamic?: DynamicTunnelConfig
}

export interface PortForwardConfig {
  id: string
  name: string
  connection_id: string
  type: 'local' | 'remote' | 'dynamic'
  local_port: number
  remote_host: string
  remote_port: number
  binding_address: string
  auto_start: boolean
}
