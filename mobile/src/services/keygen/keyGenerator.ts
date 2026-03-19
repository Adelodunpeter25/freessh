import 'react-native-get-random-values'
import { Buffer } from 'buffer'
import forge from 'node-forge'
import sodium from 'libsodium-wrappers'
import type { SSHKey } from '@/types'

export interface KeyGenerationResult {
  key: SSHKey
  privateKey: string
}

const OPENSSH_PRIVATE_KEY_BEGIN = '-----BEGIN OPENSSH PRIVATE KEY-----'
const OPENSSH_PRIVATE_KEY_END = '-----END OPENSSH PRIVATE KEY-----'
const OPENSSH_MAGIC = Buffer.from('openssh-key-v1\0', 'ascii')
const OPENSSH_BLOCK_SIZE = 8

const uint32 = (value: number) => {
  const buf = Buffer.alloc(4)
  buf.writeUInt32BE(value >>> 0, 0)
  return buf
}

const sshString = (value: Buffer) => Buffer.concat([uint32(value.length), value])

const wrapBase64 = (value: string, lineLength = 70) => {
  const lines: string[] = []
  for (let i = 0; i < value.length; i += lineLength) {
    lines.push(value.slice(i, i + lineLength))
  }
  return lines.join('\n')
}

const randomUInt32 = () => {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
      const buf = new Uint32Array(1)
      crypto.getRandomValues(buf)
      return buf[0]
    }
  } catch {
    // fall back to Math.random below
  }
  return Math.floor(Math.random() * 0xffffffff)
}

const startsWithBytes = (buf: Buffer, prefix: Buffer): boolean => {
  if (buf.length < prefix.length) return false
  for (let i = 0; i < prefix.length; i += 1) {
    if (buf[i] !== prefix[i]) return false
  }
  return true
}

const toOpenSSHPrivateKeyEd25519 = (keyPair: { publicKey: Uint8Array; privateKey: Uint8Array }, comment: string) => {
  const keyType = Buffer.from('ssh-ed25519', 'ascii')
  const publicKey = Buffer.from(keyPair.publicKey)
  const privateKey = Buffer.from(keyPair.privateKey)
  const commentBuf = Buffer.from(comment ?? '', 'utf8')

  const publicKeyBlob = Buffer.concat([
    sshString(keyType),
    sshString(publicKey),
  ])

  const checkInt = randomUInt32()
  let privateBlock = Buffer.concat([
    uint32(checkInt),
    uint32(checkInt),
    sshString(keyType),
    sshString(publicKey),
    sshString(privateKey),
    sshString(commentBuf),
  ])

  const padLen = OPENSSH_BLOCK_SIZE - (privateBlock.length % OPENSSH_BLOCK_SIZE || OPENSSH_BLOCK_SIZE)
  const padding = Buffer.alloc(padLen)
  for (let i = 0; i < padLen; i += 1) {
    padding[i] = i + 1
  }
  privateBlock = Buffer.concat([privateBlock, padding])

  const payload = Buffer.concat([
    OPENSSH_MAGIC,
    sshString(Buffer.from('none', 'ascii')),
    sshString(Buffer.from('none', 'ascii')),
    sshString(Buffer.alloc(0)),
    uint32(1),
    sshString(publicKeyBlob),
    sshString(privateBlock),
  ])

  const encoded = wrapBase64(payload.toString('base64'))
  return `${OPENSSH_PRIVATE_KEY_BEGIN}\n${encoded}\n${OPENSSH_PRIVATE_KEY_END}`
}

const readUint32 = (buf: Buffer, offset: number) => {
  if (offset + 4 > buf.length) {
    throw new Error('Invalid key format')
  }
  return { value: buf.readUInt32BE(offset), offset: offset + 4 }
}

const readSshString = (buf: Buffer, offset: number) => {
  const lenMeta = readUint32(buf, offset)
  const end = lenMeta.offset + lenMeta.value
  if (end > buf.length) {
    throw new Error('Invalid key format')
  }
  return { value: buf.subarray(lenMeta.offset, end), offset: end }
}

const normalizeAlgorithm = (keyType: string): SSHKey['algorithm'] => {
  if (keyType === 'ssh-ed25519') return 'ed25519'
  if (keyType === 'ssh-rsa') return 'rsa'
  if (keyType.startsWith('ecdsa-')) return 'ecdsa'
  return keyType
}

const bitLengthFromMpint = (value: Buffer): number => {
  if (value.length === 0) return 0
  let i = 0
  while (i < value.length && value[i] === 0) i += 1
  if (i >= value.length) return 0
  const first = value[i]
  let highBits = 8
  while (highBits > 0 && ((first >> (highBits - 1)) & 1) === 0) {
    highBits -= 1
  }
  return (value.length - i - 1) * 8 + highBits
}

const rsaBitsFromPublicBlob = (blob: Buffer): number | undefined => {
  try {
    let offset = 0
    const typeMeta = readSshString(blob, offset)
    offset = typeMeta.offset
    const keyType = typeMeta.value.toString('utf8')
    if (keyType !== 'ssh-rsa') return undefined
    const eMeta = readSshString(blob, offset)
    offset = eMeta.offset
    const nMeta = readSshString(blob, offset)
    return bitLengthFromMpint(nMeta.value)
  } catch {
    return undefined
  }
}

const parseOpenSSHPrivateKeyPublicPart = (name: string, privateKey: string) => {
  const normalized = privateKey.replace(/\r/g, '').trim()
  if (!normalized.includes(OPENSSH_PRIVATE_KEY_BEGIN) || !normalized.includes(OPENSSH_PRIVATE_KEY_END)) {
    throw new Error('Invalid OpenSSH private key format')
  }

  const base64Payload = normalized
    .replace(OPENSSH_PRIVATE_KEY_BEGIN, '')
    .replace(OPENSSH_PRIVATE_KEY_END, '')
    .replace(/\s+/g, '')

  const payload = Buffer.from(base64Payload, 'base64')
  if (!startsWithBytes(payload, OPENSSH_MAGIC)) {
    throw new Error('Invalid OpenSSH private key payload')
  }

  let offset = OPENSSH_MAGIC.length
  const cipherMeta = readSshString(payload, offset)
  offset = cipherMeta.offset
  const kdfMeta = readSshString(payload, offset)
  offset = kdfMeta.offset
  const kdfOptionsMeta = readSshString(payload, offset)
  offset = kdfOptionsMeta.offset
  void cipherMeta
  void kdfMeta
  void kdfOptionsMeta

  const keyCountMeta = readUint32(payload, offset)
  offset = keyCountMeta.offset
  if (keyCountMeta.value < 1) {
    throw new Error('OpenSSH key has no public keys')
  }

  const pubMeta = readSshString(payload, offset)
  const publicBlob = pubMeta.value

  const typeMeta = readSshString(publicBlob, 0)
  const keyType = typeMeta.value.toString('utf8')
  const publicKey = `${keyType} ${publicBlob.toString('base64')} ${name}`.trim()

  return {
    algorithm: normalizeAlgorithm(keyType),
    bits: rsaBitsFromPublicBlob(publicBlob),
    publicKey,
  }
}

const importKeyFromPrivateMaterial = (name: string, privateKey: string): KeyGenerationResult => {
  const id = Date.now().toString()
  const createdAt = new Date().toISOString()
  const trimmedKey = privateKey.trim()

  if (!trimmedKey) {
    throw new Error('Private key is required')
  }

  if (trimmedKey.includes(OPENSSH_PRIVATE_KEY_BEGIN)) {
    const parsed = parseOpenSSHPrivateKeyPublicPart(name, trimmedKey)
    return {
      key: {
        id,
        name,
        algorithm: parsed.algorithm,
        bits: parsed.bits,
        publicKey: parsed.publicKey,
        createdAt,
      },
      privateKey: trimmedKey,
    }
  }

  // PEM RSA key import path
  const rsaPrivateKey = forge.pki.privateKeyFromPem(trimmedKey) as forge.pki.rsa.PrivateKey
  if (!rsaPrivateKey?.n || !rsaPrivateKey?.e) {
    throw new Error('Unsupported private key format')
  }

  const publicKeyObj = forge.pki.setRsaPublicKey(rsaPrivateKey.n, rsaPrivateKey.e)
  const publicKey = forge.ssh.publicKeyToOpenSSH(publicKeyObj, name)
  const bits = rsaPrivateKey.n.bitLength()

  return {
    key: {
      id,
      name,
      algorithm: 'rsa',
      bits,
      publicKey,
      createdAt,
    },
    privateKey: trimmedKey,
  }
}

export const keyGenerator = {
  async generateEd25519(name: string): Promise<KeyGenerationResult> {
    await sodium.ready
    const keyPair = sodium.crypto_sign_keypair()
    
    const id = Date.now().toString()
    const createdAt = new Date().toISOString()
    
    const publicKey = `ssh-ed25519 ${Buffer.from(keyPair.publicKey).toString('base64')} ${name}`
    const privateKey = toOpenSSHPrivateKeyEd25519(keyPair, name)
    
    return {
      key: {
        id,
        name,
        algorithm: 'ed25519',
        publicKey,
        createdAt
      },
      privateKey
    }
  },

  async generateRSA(name: string, bits: number = 2048): Promise<KeyGenerationResult> {
    return new Promise((resolve, reject) => {
      forge.pki.rsa.generateKeyPair({ bits, workers: -1 }, (err, keypair) => {
        if (err) return reject(err)
        
        const id = Date.now().toString()
        const createdAt = new Date().toISOString()
        
        const publicKey = forge.ssh.publicKeyToOpenSSH(keypair.publicKey, name)
        const privateKey = forge.ssh.privateKeyToOpenSSH(keypair.privateKey)
        
        resolve({
          key: {
            id,
            name,
            algorithm: 'rsa',
            bits,
            publicKey,
            createdAt
          },
          privateKey
        })
      })
    })
  },

  async importPrivateKey(name: string, privateKey: string): Promise<KeyGenerationResult> {
    return importKeyFromPrivateMaterial(name, privateKey)
  },
}
