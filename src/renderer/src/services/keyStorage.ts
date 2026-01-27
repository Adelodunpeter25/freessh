import { SSHKey } from '../types/key'

class KeyStorageService {
  async list(): Promise<SSHKey[]> {
    return window.electron.ipcRenderer.invoke('ipc:send', {
      type: 'key:list'
    })
  }

  async save(key: Omit<SSHKey, 'id' | 'createdAt'>): Promise<SSHKey> {
    return window.electron.ipcRenderer.invoke('ipc:send', {
      type: 'key:save',
      data: key
    })
  }

  async delete(id: string): Promise<void> {
    await window.electron.ipcRenderer.invoke('ipc:send', {
      type: 'key:delete',
      data: { id }
    })
  }
}

export const keyStorageService = new KeyStorageService()
