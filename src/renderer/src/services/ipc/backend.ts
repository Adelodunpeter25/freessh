import { IPCMessage } from '../../types'

class BackendService {
  private messageHandlers: Map<string, (message: IPCMessage) => void> = new Map()

  constructor() {
    window.electron.ipcRenderer.on('backend:message', (_event, message: IPCMessage) => {
      console.log('[BackendService] Received message:', message.type, 'SessionID:', message.session_id)
      this.handleMessage(message)
    })
  }

  send(message: IPCMessage): void {
    console.log('[BackendService] Sending message:', message.type)
    window.electron.ipcRenderer.send('backend:send', message)
  }

  on(type: string, handler: (message: IPCMessage) => void): void {
    console.log('[BackendService] Registering handler for:', type)
    this.messageHandlers.set(type, handler)
  }

  off(type: string): void {
    console.log('[BackendService] Removing handler for:', type)
    this.messageHandlers.delete(type)
  }

  private handleMessage(message: IPCMessage): void {
    console.log('[BackendService] handleMessage called, type:', message.type, 'session_id:', message.session_id)
    console.log('[BackendService] Registered handlers:', Array.from(this.messageHandlers.keys()))
    
    if (message.session_id) {
      const handlerKey = `${message.type}:${message.session_id}`
      console.log('[BackendService] Looking for session handler:', handlerKey)
      const sessionHandler = this.messageHandlers.get(handlerKey)
      if (sessionHandler) {
        console.log('[BackendService] Found session handler, calling it')
        sessionHandler(message)
        return
      }

      console.log('[BackendService] No session handler found, message dropped')
      // If message has session_id, don't fall back to global handler
      // to avoid delivering terminal output to multiple listeners
      return
    }

    console.log('[BackendService] Looking for global handler:', message.type)
    const handler = this.messageHandlers.get(message.type)
    if (handler) {
      console.log('[BackendService] Found global handler, calling it')
      handler(message)
    } else {
      console.log('[BackendService] No handler found for:', message.type)
    }
  }
}

export const backendService = new BackendService()
