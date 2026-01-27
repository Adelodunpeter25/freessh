import { backendService } from './backend'
import { KeyGenerationOptions, GeneratedKeyPair } from '@/types/keygen'

export const keygenService = {
  async generateKey(options: KeyGenerationOptions): Promise<GeneratedKeyPair> {
    return new Promise((resolve, reject) => {
      const handler = (message: any) => {
        backendService.off('keygen:generate', handler)
        if (message.type === 'error') {
          reject(new Error(message.data))
        } else {
          resolve(message.data as GeneratedKeyPair)
        }
      }
      backendService.on('keygen:generate', handler)
      backendService.send({
        type: 'keygen:generate',
        data: options
      })
    })
  },

  async getFingerprint(publicKey: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const handler = (message: any) => {
        backendService.off('keygen:fingerprint', handler)
        if (message.type === 'error') {
          reject(new Error(message.data))
        } else {
          resolve(message.data.fingerprint)
        }
      }
      backendService.on('keygen:fingerprint', handler)
      backendService.send({
        type: 'keygen:fingerprint',
        data: { public_key: publicKey }
      })
    })
  }
}
