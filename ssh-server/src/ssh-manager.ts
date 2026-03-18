import { Client } from 'ssh2'
import { spawn } from 'node-pty'
import { SSHConnectionConfig, TerminalSession } from './types'

export class SSHManager {
  private sessions = new Map<string, TerminalSession>()
  private connections = new Map<string, Client>()
  private terminals = new Map<string, any>()

  async createSession(config: SSHConnectionConfig, cols: number = 80, rows: number = 24): Promise<string> {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).slice(2)}`
    
    const session: TerminalSession = {
      id: sessionId,
      connectionId: `${config.host}:${config.port}`,
      name: `${config.username}@${config.host}`,
      cols,
      rows,
      status: 'connecting'
    }

    this.sessions.set(sessionId, session)

    try {
      const client = new Client()
      this.connections.set(sessionId, client)

      await new Promise<void>((resolve, reject) => {
        client.on('ready', () => {
          session.status = 'connected'
          resolve()
        })

        client.on('error', (err) => {
          session.status = 'error'
          reject(err)
        })

        const connectConfig: any = {
          host: config.host,
          port: config.port,
          username: config.username,
        }

        if (config.authMethod === 'password') {
          connectConfig.password = config.password
        } else {
          connectConfig.privateKey = config.privateKey
          if (config.passphrase) {
            connectConfig.passphrase = config.passphrase
          }
        }

        client.connect(connectConfig)
      })

      return sessionId
    } catch (error) {
      this.sessions.delete(sessionId)
      this.connections.delete(sessionId)
      throw error
    }
  }

  async startShell(sessionId: string, onData: (data: string) => void): Promise<void> {
    const client = this.connections.get(sessionId)
    const session = this.sessions.get(sessionId)
    
    if (!client || !session) {
      throw new Error('Session not found')
    }

    return new Promise((resolve, reject) => {
      client.shell({
        cols: session.cols,
        rows: session.rows,
        term: 'xterm-256color'
      }, (err, stream) => {
        if (err) {
          reject(err)
          return
        }

        this.terminals.set(sessionId, stream)

        stream.on('data', (data: Buffer) => {
          onData(data.toString())
        })

        stream.on('close', () => {
          session.status = 'disconnected'
          this.cleanup(sessionId)
        })

        resolve()
      })
    })
  }

  writeToShell(sessionId: string, data: string): void {
    const stream = this.terminals.get(sessionId)
    if (stream) {
      stream.write(data)
    }
  }

  resizeTerminal(sessionId: string, cols: number, rows: number): void {
    const stream = this.terminals.get(sessionId)
    const session = this.sessions.get(sessionId)
    
    if (stream && session) {
      session.cols = cols
      session.rows = rows
      stream.setWindow(rows, cols)
    }
  }

  closeSession(sessionId: string): void {
    this.cleanup(sessionId)
  }

  private cleanup(sessionId: string): void {
    const stream = this.terminals.get(sessionId)
    const client = this.connections.get(sessionId)

    if (stream) {
      stream.end()
      this.terminals.delete(sessionId)
    }

    if (client) {
      client.end()
      this.connections.delete(sessionId)
    }

    this.sessions.delete(sessionId)
  }

  getSession(sessionId: string): TerminalSession | undefined {
    return this.sessions.get(sessionId)
  }

  getAllSessions(): TerminalSession[] {
    return Array.from(this.sessions.values())
  }
}
