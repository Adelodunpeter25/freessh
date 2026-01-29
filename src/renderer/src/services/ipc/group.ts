import { backendService } from './backend'
import { Group } from '@/types'

const TIMEOUT = 5000 // 5 seconds

export const groupService = {
  list(): Promise<Group[]> {
    console.log('[GroupService] Sending group:list request')
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.error('[GroupService] group:list timeout')
        backendService.off('group:list')
        reject(new Error('Request timeout'))
      }, TIMEOUT)

      const handler = (message: any) => {
        console.log('[GroupService] Received group:list response:', message)
        clearTimeout(timeout)
        backendService.off('group:list')
        
        if (message.type === 'error') {
          console.error('[GroupService] group:list error:', message.data?.error)
          reject(new Error(message.data?.error || 'Failed to list groups'))
          return
        }
        
        if (message.data?.groups) {
          console.log('[GroupService] group:list success, groups:', message.data.groups)
          resolve(message.data.groups)
        } else {
          console.error('[GroupService] group:list invalid response')
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
    console.log('[GroupService] Sending group:create request:', name)
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.error('[GroupService] group:create timeout')
        backendService.off('group:create')
        reject(new Error('Request timeout'))
      }, TIMEOUT)

      const handler = (message: any) => {
        console.log('[GroupService] Received group:create response:', message)
        clearTimeout(timeout)
        backendService.off('group:create')
        
        if (message.type === 'error') {
          console.error('[GroupService] group:create error:', message.data?.error)
          reject(new Error(message.data?.error || 'Failed to create group'))
          return
        }
        
        if (message.data?.group) {
          console.log('[GroupService] group:create success, group:', message.data.group)
          resolve(message.data.group)
        } else {
          console.error('[GroupService] group:create invalid response')
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
    console.log('[GroupService] Sending group:rename request:', id, newName)
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.error('[GroupService] group:rename timeout')
        backendService.off('group:rename')
        reject(new Error('Request timeout'))
      }, TIMEOUT)

      const handler = (message: any) => {
        console.log('[GroupService] Received group:rename response:', message)
        clearTimeout(timeout)
        backendService.off('group:rename')
        
        if (message.type === 'error') {
          console.error('[GroupService] group:rename error:', message.data?.error)
          reject(new Error(message.data?.error || 'Failed to rename group'))
          return
        }
        
        if (message.data?.success) {
          console.log('[GroupService] group:rename success')
          resolve()
        } else {
          console.error('[GroupService] group:rename invalid response')
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
    console.log('[GroupService] Sending group:delete request:', id)
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.error('[GroupService] group:delete timeout')
        backendService.off('group:delete')
        reject(new Error('Request timeout'))
      }, TIMEOUT)

      const handler = (message: any) => {
        console.log('[GroupService] Received group:delete response:', message)
        clearTimeout(timeout)
        backendService.off('group:delete')
        
        if (message.type === 'error') {
          console.error('[GroupService] group:delete error:', message.data?.error)
          reject(new Error(message.data?.error || 'Failed to delete group'))
          return
        }
        
        if (message.data?.success) {
          console.log('[GroupService] group:delete success')
          resolve()
        } else {
          console.error('[GroupService] group:delete invalid response')
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
