export type MessageType =
  | 'connect'
  | 'disconnect'
  | 'input'
  | 'output'
  | 'resize'
  | 'error'
  | 'session_status'
  | 'session_list'
  | 'connection:list'
  | 'connection:get'
  | 'connection:delete'
  | 'connection:update'
  | 'connection:connect'
  | 'sftp:list'
  | 'sftp:upload'
  | 'sftp:download'
  | 'sftp:delete'
  | 'sftp:mkdir'
  | 'sftp:rename'
  | 'sftp:progress'

export interface IPCMessage {
  type: MessageType
  session_id?: string
  data?: any
}

export interface ConnectRequest {
  config: import('./connection').ConnectionConfig
}

export interface InputData {
  data: string
}

export interface ResizeData {
  rows: number
  cols: number
}

export interface ErrorResponse {
  error: string
}
