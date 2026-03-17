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
  }
}
