export type AuthMethod = 'password' | 'publickey' | 'keyboard-interactive'

export interface ConnectionConfig {
  id: string
  name: string
  host: string
  port: number
  username: string
  auth_method: AuthMethod
  password?: string
  private_key?: string
  passphrase?: string
}
