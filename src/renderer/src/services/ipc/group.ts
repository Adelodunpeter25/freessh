import { backendService } from './backend'
import { Group } from '@/types'

const TIMEOUT = 5000 // 5 seconds

export const groupService = {
  list(): Promise<Group[]> {
    return new Promise((resolve, reject) => {
      const handler = (message: any) => {
        clearTimeout(timeout)
        backendService.off('group:list', handler)
        
        if (message.type === 'error') {
          reject(new Error(message.data?.error || 'Failed to list groups'))
          return
        }
        
        if (message.data?.groups) {
          resolve(message.data.groups)
        } else {
          reject(new Error('Invalid response'))
        }
      }

      backendService.on('group:list', handler)

      const timeout = setTimeout(() => {
        backendService.off('group:list', handler)
        reject(new Error('Request timeout'))
      }, TIMEOUT)

      backendService.send({
        type: 'group:list',
        data: {}
      })
    })
  },

  create(name: string): Promise<Group> {
    return new Promise((resolve, reject) => {
      const handler = (message: any) => {
        clearTimeout(timeout)
        backendService.off('group:create', handler)
        
        if (message.type === 'error') {
          reject(new Error(message.data?.error || 'Failed to create group'))
          return
        }
        
        if (message.data?.group) {
          resolve(message.data.group)
        } else {
          reject(new Error('Invalid response'))
        }
      }

      backendService.on('group:create', handler)

      const timeout = setTimeout(() => {
        backendService.off('group:create', handler)
        reject(new Error('Request timeout'))
      }, TIMEOUT)

      backendService.send({
        type: 'group:create',
        data: { name }
      })
    })
  },

  rename(id: string, newName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const handler = (message: any) => {
        clearTimeout(timeout)
        backendService.off('group:rename', handler)
        
        if (message.type === 'error') {
          reject(new Error(message.data?.error || 'Failed to rename group'))
          return
        }
        
        if (message.data?.success) {
          resolve()
        } else {
          reject(new Error('Invalid response'))
        }
      }

      backendService.on('group:rename', handler)

      const timeout = setTimeout(() => {
        backendService.off('group:rename', handler)
        reject(new Error('Request timeout'))
      }, TIMEOUT)

      backendService.send({
        type: 'group:rename',
        data: { id, new_name: newName }
      })
    })
  },

  delete(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const handler = (message: any) => {
        clearTimeout(timeout)
        backendService.off('group:delete', handler)
        
        if (message.type === 'error') {
          reject(new Error(message.data?.error || 'Failed to delete group'))
          return
        }
        
        if (message.data?.success) {
          resolve()
        } else {
          reject(new Error('Invalid response'))
        }
      }

      backendService.on('group:delete', handler)

      const timeout = setTimeout(() => {
        backendService.off('group:delete', handler)
        reject(new Error('Request timeout'))
      }, TIMEOUT)

      backendService.send({
        type: 'group:delete',
        data: { id }
      })
    })
  }
}
