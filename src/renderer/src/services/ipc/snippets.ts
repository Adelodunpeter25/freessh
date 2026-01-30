import { backendService } from './backend'
import { IPCMessage } from '@/types'
import { Snippet, CreateSnippetRequest, UpdateSnippetRequest } from '@/types/snippet'

export const snippetService = {
  async list(): Promise<Snippet[]> {
    return new Promise((resolve, reject) => {
      const handler = (message: IPCMessage) => {
        if (message.type === 'snippet:list') {
          backendService.off('snippet:list')
          backendService.off('error')
          resolve(message.data.snippets || [])
        } else if (message.type === 'error') {
          backendService.off('snippet:list')
          backendService.off('error')
          reject(new Error(message.data.error))
        }
      }

      backendService.on('snippet:list', handler)
      backendService.on('error', handler)

      backendService.send({
        type: 'snippet:list',
        data: {}
      })
    })
  },

  async create(request: CreateSnippetRequest): Promise<Snippet> {
    return new Promise((resolve, reject) => {
      const handler = (message: IPCMessage) => {
        if (message.type === 'snippet:create') {
          backendService.off('snippet:create')
          backendService.off('error')
          resolve(message.data.snippet)
        } else if (message.type === 'error') {
          backendService.off('snippet:create')
          backendService.off('error')
          reject(new Error(message.data.error))
        }
      }

      backendService.on('snippet:create', handler)
      backendService.on('error', handler)

      backendService.send({
        type: 'snippet:create',
        data: request
      })
    })
  },

  async update(request: UpdateSnippetRequest): Promise<Snippet> {
    return new Promise((resolve, reject) => {
      const handler = (message: IPCMessage) => {
        if (message.type === 'snippet:update') {
          backendService.off('snippet:update')
          backendService.off('error')
          resolve(message.data.snippet)
        } else if (message.type === 'error') {
          backendService.off('snippet:update')
          backendService.off('error')
          reject(new Error(message.data.error))
        }
      }

      backendService.on('snippet:update', handler)
      backendService.on('error', handler)

      backendService.send({
        type: 'snippet:update',
        data: request
      })
    })
  },

  async delete(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const handler = (message: IPCMessage) => {
        if (message.type === 'snippet:delete') {
          backendService.off('snippet:delete')
          backendService.off('error')
          resolve()
        } else if (message.type === 'error') {
          backendService.off('snippet:delete')
          backendService.off('error')
          reject(new Error(message.data.error))
        }
      }

      backendService.on('snippet:delete', handler)
      backendService.on('error', handler)

      backendService.send({
        type: 'snippet:delete',
        data: { id }
      })
    })
  }
}
