import { Router } from 'express'
import { SSHManager } from './ssh-manager'

const router = Router()

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Get all sessions
router.get('/sessions', (req, res) => {
  const sshManager = req.app.locals.sshManager as SSHManager
  res.json(sshManager.getAllSessions())
})

// Get specific session
router.get('/sessions/:sessionId', (req, res) => {
  const sshManager = req.app.locals.sshManager as SSHManager
  const session = sshManager.getSession(req.params.sessionId)
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' })
  }
  
  res.json(session)
})

export default router
