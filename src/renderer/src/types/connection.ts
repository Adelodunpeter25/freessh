export type AuthMethod = 'password' | 'publickey'

export interface ConnectionConfig {
  id: string
  name: string
  host: string
  port: number
  username: string
  auth_method: AuthMethod
  private_key?: string
  group?: string
}

