import express from 'express'
import cors from 'cors'
import { WebSocketServer, WebSocket } from 'ws'
import { createServer } from 'http'
import { SSHManager } from './ssh-manager'
import { WebSocketMessage, WebSocketResponse } from './types'

const app = express()
const server = createServer(app)
const wss = new WebSocketServer({ server })
const sshManager = new SSHManager()

app.use(cors())
app.use(express.json())

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Get all sessions
app.get('/sessions', (req, res) => {
  res.json(sshManager.getAllSessions())
})

// WebSocket connection handling
wss.on('connection', (ws: WebSocket) => {
  console.log('Client connected')

  ws.on('message', async (data: Buffer) => {
    try {
      const message: WebSocketMessage = JSON.parse(data.toString())
      await handleWebSocketMessage(ws, message)
    } catch (error) {
      console.error('WebSocket message error:', error)
      sendResponse(ws, {
        type: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  })

  ws.on('close', () => {
    console.log('Client disconnected')
  })

  ws.on('error', (error) => {
    console.error('WebSocket error:', error)
  })
})

async function handleWebSocketMessage(ws: WebSocket, message: WebSocketMessage) {
  switch (message.type) {
    case 'connect':
      try {
        const { config, cols = 80, rows = 24 } = message.data
        const sessionId = await sshManager.createSession(config, cols, rows)
        
        // Start shell and set up data handler
        await sshManager.startShell(sessionId, (data: string) => {
          sendResponse(ws, {
            type: 'data',
            sessionId,
            data
          })
        })

        sendResponse(ws, {
          type: 'connected',
          sessionId,
          data: { cols, rows }
        })
      } catch (error) {
        sendResponse(ws, {
          type: 'error',
          error: error instanceof Error ? error.message : 'Connection failed'
        })
      }
      break

    case 'input':
      if (message.sessionId && message.data) {
        sshManager.writeToShell(message.sessionId, message.data)
      }
      break

    case 'resize':
      if (message.sessionId && message.data) {
        const { cols, rows } = message.data
        sshManager.resizeTerminal(message.sessionId, cols, rows)
      }
      break

    case 'disconnect':
      if (message.sessionId) {
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

server.listen(PORT, () => {
  console.log(`SSH Server running on port ${PORT}`)
  console.log(`WebSocket endpoint: ws://localhost:${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/health`)
})
