export type MessageType = string

export interface IPCMessage {
  type: MessageType
  request_id?: string
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

export interface LoggingStatusResponse {
  is_logging: boolean
  file_path?: string
  error?: string
}
