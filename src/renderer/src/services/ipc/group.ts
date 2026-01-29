import { backendService } from './backend'
import { Group } from '@/types'

export const groupService = {
  list(): Promise<Group[]> {
    return new Promise((resolve, reject) => {
      const handler = (message: any) => {
        backendService.off('group:list')
        if (message.data?.groups) {
          resolve(message.data.groups)
        } else {
          reject(new Error('Failed to list groups'))
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
      const handler = (message: any) => {
        backendService.off('group:create')
        if (message.data?.group) {
          resolve(message.data.group)
        } else {
          reject(new Error('Failed to create group'))
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
      const handler = (message: any) => {
        backendService.off('group:rename')
        if (message.data?.success) {
          resolve()
        } else {
          reject(new Error('Failed to rename group'))
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
      const handler = (message: any) => {
        backendService.off('group:delete')
        if (message.data?.success) {
          resolve()
        } else {
          reject(new Error('Failed to delete group'))
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
