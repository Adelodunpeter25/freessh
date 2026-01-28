export type SessionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'
export type SessionType = 'ssh' | 'local'

export interface Session {
  id: string
  connection_id: string
  type: SessionType
  status: SessionStatus
  connected_at?: string
  error?: string
  os_type?: string
}
