export type MessageType =
  | 'connect'
  | 'connect_local'
  | 'disconnect'
  | 'input'
  | 'output'
  | 'resize'
  | 'error'
  | 'session_status'
  | 'session_list'
  | 'terminal:start_logging'
  | 'terminal:stop_logging'
  | 'terminal:logging_status'
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
  | 'sftp:cancel'
  | 'sftp:readfile'
  | 'sftp:writefile'
  | 'sftp:chmod'
  | 'portforward:create'
  | 'portforward:stop'
  | 'portforward:list'
  | 'portforward_config:list'
  | 'portforward_config:get'
  | 'portforward_config:create'
  | 'portforward_config:update'
  | 'portforward_config:delete'
  | 'keychain:set'
  | 'keychain:get'
  | 'keychain:delete'
  | 'keygen:generate'
  | 'keygen:fingerprint'
  | 'key:list'
  | 'key:save'
  | 'key:import'
  | 'key:update'
  | 'key:delete'
  | 'key:export'
  | 'known_host:list'
  | 'known_host:remove'
  | 'known_host:trust'
  | 'known_host:import'
  | 'host_key:verify'
  | 'host_key:verify_response'
  | 'group:list'
  | 'group:create'
  | 'group:rename'
  | 'group:delete'

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

export interface LoggingStatusResponse {
  is_logging: boolean
  file_path?: string
  error?: string
}
