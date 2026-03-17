export interface KnownHost {
  id: string
  hostname: string
  port: number
  fingerprint: string
  publicKey: string
}

export interface HostKeyVerification {
  status: 'new' | 'known' | 'changed'
  hostname: string
  port: number
  fingerprint: string
  keyType: string
  oldFingerprint?: string
}
