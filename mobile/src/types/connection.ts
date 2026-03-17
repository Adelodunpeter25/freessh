export type AuthMethod = 'password' | 'publickey'

export interface SessionProfile {
  term?: string
  font_size?: number
  startup_command?: string
  startup_command_delay_ms?: number
  terminal_theme?: string
}

export interface ConnectionConfig {
  id: string
  name: string
  host: string
  port: number
  username: string
  auth_method: AuthMethod
  private_key?: string
  key_id?: string
  password?: string
  group?: string
  profile?: SessionProfile
}
