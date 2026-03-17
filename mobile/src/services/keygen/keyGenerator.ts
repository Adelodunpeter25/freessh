import 'react-native-get-random-values'
import forge from 'node-forge'
import sodium from 'libsodium-wrappers'
import type { SSHKey } from '@/types'

export interface KeyGenerationResult {
  key: SSHKey
  privateKey: string
}

export const keyGenerator = {
  async generateEd25519(name: string): Promise<KeyGenerationResult> {
    await sodium.ready
    const keyPair = sodium.crypto_sign_keypair()
    
    const id = Date.now().toString()
    const createdAt = new Date().toISOString()
    
    // Convert to OpenSSH format or compatible string representation
    const publicKey = `ssh-ed25519 ${Buffer.from(keyPair.publicKey).toString('base64')} ${name}`
    const privateKey = Buffer.from(keyPair.privateKey).toString('base64')
    
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
        
        const publicKeyPem = forge.pki.publicKeyToPem(keypair.publicKey)
        const privateKeyPem = forge.pki.privateKeyToPem(keypair.privateKey)
        
        // This is simplified for storage, real SSH format would use forge's ssh encoding
        const publicKey = publicKeyPem
        const privateKey = privateKeyPem
        
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
