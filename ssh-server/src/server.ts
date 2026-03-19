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
  console.log('Client connected')

  ws.on('message', async (data: Buffer) => {
    try {
      const message: WebSocketMessage = JSON.parse(data.toString())
      await handleWebSocketMessage(ws, message)
    } catch (error) {
      console.error('WebSocket error:', error)
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
        console.log(`Connecting to ${config.username}@${config.host}`)
        
        const sessionId = message.sessionId || await sshManager.createSession(config, cols, rows)
        
        if (message.sessionId) {
          await sshManager.createSessionWithId(message.sessionId, config, cols, rows)
        }
        
        await sshManager.startShell(sessionId, (data: string) => {
          sendResponse(ws, {
            type: 'data',
            sessionId,
            data
          })
        })

        console.log(`Connected ${sessionId}`)
        
        sendResponse(ws, {
          type: 'connected',
          sessionId,
          data: { cols, rows }
        })
      } catch (error) {
        console.error('Connection failed:', error)
        const errorMessage = error instanceof Error ? error.message : 'Connection failed'
        sendResponse(ws, {
          type: 'error',
          sessionId: message.sessionId,
          error: errorMessage
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

server.listen(PORT, '0.0.0.0', () => {
  console.log(`SSH Server running on 0.0.0.0:${PORT}`)
  console.log(`WebSocket endpoint: ws://192.168.1.107:${PORT}`)
  console.log(`Health check: http://192.168.1.107:${PORT}/health`)
})
