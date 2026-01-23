export type AuthMethod = 'password' | 'publickey'

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
  group?: string
}
