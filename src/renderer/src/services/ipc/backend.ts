import { IPCMessage } from '../../types'

class BackendService {
  private messageHandlers: Map<string, Set<(message: IPCMessage) => void>> = new Map()

  constructor() {
    window.electron.ipcRenderer.on('backend:message', (_event, message: IPCMessage) => {
      this.handleMessage(message)
    })
  }

  send(message: IPCMessage): void {
    window.electron.ipcRenderer.send('backend:send', message)
  }

  on(type: string, handler: (message: IPCMessage) => void): void {
    const existing = this.messageHandlers.get(type)
    if (existing) {
      existing.add(handler)
      return
    }

    this.messageHandlers.set(type, new Set([handler]))
  }

  off(type: string, handler?: (message: IPCMessage) => void): void {
    if (!handler) {
      this.messageHandlers.delete(type)
      return
    }

    const handlers = this.messageHandlers.get(type)
    if (!handlers) return

    handlers.delete(handler)
    if (handlers.size === 0) {
      this.messageHandlers.delete(type)
    }
  }

  private handleMessage(message: IPCMessage): void {
    if (message.session_id) {
      const handlerKey = `${message.type}:${message.session_id}`
      const sessionHandlers = this.messageHandlers.get(handlerKey)
      if (sessionHandlers && sessionHandlers.size > 0) {
        this.emit(sessionHandlers, message)
        return
      }

      // For session_status, error, SFTP, and bulk messages, fall back to global handler
      // These are used during connection establishment or are request-response patterns
      if (message.type === 'session_status' || message.type === 'error' || message.type.startsWith('sftp:') || message.type.startsWith('bulk:')) {
        const globalHandlers = this.messageHandlers.get(message.type)
        if (globalHandlers && globalHandlers.size > 0) {
          this.emit(globalHandlers, message)
          return
        }
      }

      // If message has session_id, don't fall back to global handler
      // to avoid delivering terminal output to multiple listeners
      return
    }

    const handlers = this.messageHandlers.get(message.type)
    if (handlers && handlers.size > 0) {
      this.emit(handlers, message)
    }
  }

  private emit(handlers: Set<(message: IPCMessage) => void>, message: IPCMessage): void {
    for (const handler of handlers) {
      handler(message)
    }
  }
}

export const backendService = new BackendService()
