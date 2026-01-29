import { backendService } from './backend'
import { Group } from '@/types'

const TIMEOUT = 5000 // 5 seconds

export const groupService = {
  list(): Promise<Group[]> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        backendService.off('group:list')
        reject(new Error('Request timeout'))
      }, TIMEOUT)

      const handler = (message: any) => {
        clearTimeout(timeout)
        backendService.off('group:list')
        
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
      backendService.send({
        type: 'group:list',
        data: {}
      })
    })
  },

  create(name: string): Promise<Group> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        backendService.off('group:create')
        reject(new Error('Request timeout'))
      }, TIMEOUT)

      const handler = (message: any) => {
        clearTimeout(timeout)
        backendService.off('group:create')
        
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
      backendService.send({
        type: 'group:create',
        data: { name }
      })
    })
  },

  rename(id: string, newName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        backendService.off('group:rename')
        reject(new Error('Request timeout'))
      }, TIMEOUT)

      const handler = (message: any) => {
        clearTimeout(timeout)
        backendService.off('group:rename')
        
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
      backendService.send({
        type: 'group:rename',
        data: { id, new_name: newName }
      })
    })
  },

  delete(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        backendService.off('group:delete')
        reject(new Error('Request timeout'))
      }, TIMEOUT)

      const handler = (message: any) => {
        clearTimeout(timeout)
        backendService.off('group:delete')
        
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
      backendService.send({
        type: 'group:delete',
        data: { id }
      })
    })
  }
}
