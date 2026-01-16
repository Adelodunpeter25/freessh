import { IPCMessage } from '../../types'

class BackendService {
  private messageHandlers: Map<string, (message: IPCMessage) => void> = new Map()

  constructor() {
    window.electron.ipcRenderer.on('backend:message', (_event, message: IPCMessage) => {
      this.handleMessage(message)
    })
  }

  send(message: IPCMessage): void {
    window.electron.ipcRenderer.send('backend:send', message)
  }

  on(type: string, handler: (message: IPCMessage) => void): void {
    this.messageHandlers.set(type, handler)
  }

  off(type: string): void {
    this.messageHandlers.delete(type)
  }

  private handleMessage(message: IPCMessage): void {
    console.log('[Backend] received:', message.type, message.session_id)
    
    if (message.session_id) {
      const handlerKey = `${message.type}:${message.session_id}`
      const sessionHandler = this.messageHandlers.get(handlerKey)
      if (sessionHandler) {
        sessionHandler(message)
        return
      }
    }

    const handler = this.messageHandlers.get(message.type)
    if (handler) {
      handler(message)
    } else {
      console.log('[Backend] no handler for:', message.type)
    }
  }
}

export const backendService = new BackendService()
