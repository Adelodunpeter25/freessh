export interface SSHKey {
  id: string
  name: string
  algorithm: string
  bits?: number
  publicKey: string
  createdAt: Date
}
