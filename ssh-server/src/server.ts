import express from 'express'
import cors from 'cors'
import { WebSocketServer, WebSocket } from 'ws'
import { createServer } from 'http'
import { SSHManager } from './ssh-manager'
import { WebSocketMessage, WebSocketResponse } from './types'
import routes from './routes'

const app = express()
const server = createServer(app)
const wss = new WebSocketServer({ server })
const sshManager = new SSHManager()

app.use(cors())
app.use(express.json())

// Make sshManager available to routes
app.locals.sshManager = sshManager

// Use routes
app.use('/api', routes)

// WebSocket connection handling
wss.on('connection', (ws: WebSocket) => {
  console.log('📱 Client connected')

  ws.on('message', async (data: Buffer) => {
    try {
      const message: WebSocketMessage = JSON.parse(data.toString())
      console.log('📨 Received:', message.type, message.sessionId ? `(${message.sessionId})` : '')
      await handleWebSocketMessage(ws, message)
    } catch (error) {
      console.error('❌ WebSocket message error:', error)
      sendResponse(ws, {
        type: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  })

  ws.on('close', () => {
    console.log('📱 Client disconnected')
  })

  ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error)
  })
})

async function handleWebSocketMessage(ws: WebSocket, message: WebSocketMessage) {
  switch (message.type) {
    case 'connect':
      try {
        const { config, cols = 80, rows = 24 } = message.data
        console.log(`🔌 Connecting to ${config.username}@${config.host}:${config.port}`)
        
        // Use provided sessionId or create new one
        const sessionId = message.sessionId || await sshManager.createSession(config, cols, rows)
        console.log(`📝 Using session ID: ${sessionId}`)
        
        // If sessionId was provided, we need to create the session with that ID
        if (message.sessionId) {
          // Custom session creation with specific ID
          const customSessionId = await sshManager.createSessionWithId(message.sessionId, config, cols, rows)
        }
        
        // Start shell and set up data handler
        await sshManager.startShell(sessionId, (data: string) => {
          console.log(`📤 Sending data for ${sessionId}:`, data.slice(0, 50) + (data.length > 50 ? '...' : ''))
          sendResponse(ws, {
            type: 'data',
            sessionId,
            data
          })
        })

        console.log(`✅ Connected session ${sessionId}`)
        sendResponse(ws, {
          type: 'connected',
          sessionId,
          data: { cols, rows }
        })
      } catch (error) {
        console.error('❌ Connection failed:', error)
        sendResponse(ws, {
          type: 'error',
          error: error instanceof Error ? error.message : 'Connection failed'
        })
      }
      break

    case 'input':
      if (message.sessionId && message.data) {
        console.log(`⌨️  Input for ${message.sessionId}:`, JSON.stringify(message.data))
        sshManager.writeToShell(message.sessionId, message.data)
      }
      break

    case 'resize':
      if (message.sessionId && message.data) {
        const { cols, rows } = message.data
        console.log(`📐 Resize ${message.sessionId}: ${cols}x${rows}`)
        sshManager.resizeTerminal(message.sessionId, cols, rows)
      }
      break

    case 'disconnect':
      if (message.sessionId) {
        console.log(`🔌 Disconnecting session ${message.sessionId}`)
        sshManager.closeSession(message.sessionId)
        sendResponse(ws, {
          type: 'disconnected',
          sessionId: message.sessionId
        })
      }
      break

    default:
      sendResponse(ws, {
        type: 'error',
        error: `Unknown message type: ${message.type}`
      })
  }
}

function sendResponse(ws: WebSocket, response: WebSocketResponse) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(response))
  }
}

const PORT = process.env.PORT || 3001

server.listen(PORT, '0.0.0.0', () => {
  console.log(`SSH Server running on 0.0.0.0:${PORT}`)
  console.log(`WebSocket endpoint: ws://192.168.1.107:${PORT}`)
  console.log(`Health check: http://192.168.1.107:${PORT}/health`)
})
