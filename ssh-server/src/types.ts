export interface SSHConnectionConfig {
  host: string
  port: number
  username: string
  authMethod: 'password' | 'key'
  password?: string
  privateKey?: string
  passphrase?: string
}

export interface TerminalSession {
  id: string
  connectionId: string
  name: string
  cols: number
  rows: number
  status: 'connecting' | 'connected' | 'disconnected' | 'error'
}

export interface WebSocketMessage {
  type: 'connect' | 'input' | 'resize' | 'disconnect'
  sessionId?: string
  data?: any
}

export interface WebSocketResponse {
  type: 'connected' | 'data' | 'error' | 'disconnected'
  sessionId?: string
  data?: any
  error?: string
}
