import { getSSHServerURL } from '@/constants'
import type { ConnectionConfig } from '@/types'

export interface WebSocketMessage {
  type: 'connect' | 'input' | 'resize' | 'disconnect'
  sessionId?: string
  data?: any
}

export interface WebSocketResponse {
  type: 'connected' | 'data' | 'error' | 'disconnected'
  sessionId?: string
  data?: any
  error?: string
}

export class SSHWebSocketService {
  private ws: WebSocket | null = null
  private listeners = new Map<string, Set<(data: any) => void>>()

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(getSSHServerURL())
        
        this.ws.onopen = () => {
          console.log('WebSocket connected to SSH server')
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const response: WebSocketResponse = JSON.parse(event.data)
            this.handleMessage(response)
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error)
          }
        }

        this.ws.onclose = () => {
          console.log('WebSocket disconnected from SSH server')
          this.ws = null
        }

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error)
          reject(error)
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  private handleMessage(response: WebSocketResponse) {
    const listeners = this.listeners.get(response.type)
    if (listeners) {
      listeners.forEach(listener => listener(response))
    }
  }

  createSSHSession(connection: ConnectionConfig, cols: number = 80, rows: number = 24): void {
    const config = {
      host: connection.host,
      port: connection.port || 22,
      username: connection.username,
      authMethod: connection.auth_method,
      password: connection.password,
      privateKey: connection.private_key,
      passphrase: connection.passphrase,
    }

    this.sendMessage({
      type: 'connect',
      data: { config, cols, rows }
    })
  }

  sendInput(sessionId: string, data: string): void {
    this.sendMessage({
      type: 'input',
      sessionId,
      data
    })
  }

  resizeTerminal(sessionId: string, cols: number, rows: number): void {
    this.sendMessage({
      type: 'resize',
      sessionId,
      data: { cols, rows }
    })
  }

  disconnectSession(sessionId: string): void {
    this.sendMessage({
      type: 'disconnect',
      sessionId
    })
  }

  private sendMessage(message: WebSocketMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.error('WebSocket not connected')
    }
  }

  on(event: string, listener: (data: any) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    
    const eventListeners = this.listeners.get(event)!
    eventListeners.add(listener)

    // Return unsubscribe function
    return () => {
      eventListeners.delete(listener)
      if (eventListeners.size === 0) {
        this.listeners.delete(event)
      }
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.listeners.clear()
  }
}

export const sshWebSocketService = new SSHWebSocketService()
