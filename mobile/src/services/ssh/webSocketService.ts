import { getSSHServerURL } from '@/constants'
import type { ConnectionConfig } from '@/types'
import { ReconnectManager } from './reconnect'

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
  private reconnectManager: ReconnectManager
  private isConnecting = false

  constructor() {
    this.reconnectManager = new ReconnectManager(
      () => this.connect(),
      () => console.log('Max reconnect attempts reached')
    )
  }

  connect(): Promise<void> {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return Promise.resolve()
    }

    this.isConnecting = true
    
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(getSSHServerURL())
        
        this.ws.onopen = () => {
          this.isConnecting = false
          this.reconnectManager.reset()
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
          this.isConnecting = false
          this.ws = null
          this.reconnectManager.attemptReconnect()
        }

        this.ws.onerror = (error) => {
          this.isConnecting = false
          console.error('WebSocket error:', error)
          reject(error)
        }
      } catch (error) {
        this.isConnecting = false
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

  createSSHSession(connection: ConnectionConfig, cols: number = 80, rows: number = 24, sessionId?: string): void {
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
      sessionId,
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
    this.reconnectManager.stop()
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.listeners.clear()
  }
}

export const sshWebSocketService = new SSHWebSocketService()
