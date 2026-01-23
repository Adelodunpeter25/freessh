export type SessionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

export interface Session {
  id: string
  connection_id: string
  status: SessionStatus
  connected_at?: string
  error?: string
  os_type?: string
}
