import { backendService } from './backend'

export const keychainService = {
  async setPassword(account: string, password: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const handler = (message: any) => {
        backendService.off('keychain:set', handler)
        if (message.type === 'error') {
          reject(new Error(message.data))
        } else {
          resolve()
        }
      }
      backendService.on('keychain:set', handler)
      backendService.send({
        type: 'keychain:set',
        data: { account, password }
      })
    })
  },

  async getPassword(account: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const handler = (message: any) => {
        backendService.off('keychain:get', handler)
        if (message.type === 'error') {
          reject(new Error(message.data))
        } else {
          resolve(message.data.password)
        }
      }
      backendService.on('keychain:get', handler)
      backendService.send({
        type: 'keychain:get',
        data: { account }
      })
    })
  },

  async deletePassword(account: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const handler = (message: any) => {
        backendService.off('keychain:delete', handler)
        if (message.type === 'error') {
          reject(new Error(message.data))
        } else {
          resolve()
        }
      }
      backendService.on('keychain:delete', handler)
      backendService.send({
        type: 'keychain:delete',
        data: { account }
      })
    })
  }
}
