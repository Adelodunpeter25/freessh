export interface KnownHost {
  id: string
  hostname: string
  port: number
  keyType: string
  fingerprint: string
  publicKey: string
  firstSeen: string
  lastSeen: string
}

export interface HostKeyVerification {
  status: 'new' | 'known' | 'changed'
  hostname: string
  port: number
  fingerprint: string
  keyType: string
  oldFingerprint?: string
}
