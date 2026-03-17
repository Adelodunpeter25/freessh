export type KeyType = 'rsa' | 'ed25519'

export interface KeyGenerationOptions {
  key_type: KeyType
  key_size?: number
  comment?: string
  passphrase?: string
}

export interface GeneratedKeyPair {
  private_key: string
  public_key: string
  fingerprint: string
}
