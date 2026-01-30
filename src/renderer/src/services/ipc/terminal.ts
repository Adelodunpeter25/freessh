import { backendService } from './backend'
import { IPCMessage } from '../../types'

export const terminalService = {
  sendInput(sessionId: string, data: string): void {
    backendService.send({
      type: 'input',
      session_id: sessionId,
      data: { data }
    })
  },

  resize(sessionId: string, rows: number, cols: number): void {
    backendService.send({
      type: 'resize',
      session_id: sessionId,
      data: { rows, cols }
    })
  },

  onOutput(sessionId: string, callback: (output: string) => void): void {
    const handler = (message: IPCMessage) => {
      callback(message.data.output)
    }
    backendService.on(`output:${sessionId}`, handler)
  },

  offOutput(sessionId: string): void {
    backendService.off(`output:${sessionId}`)
  },

  startLogging(sessionId: string): void {
    backendService.send({
      type: 'terminal:start_logging',
      session_id: sessionId
    })
  },

  stopLogging(sessionId: string): void {
    backendService.send({
      type: 'terminal:stop_logging',
      session_id: sessionId
    })
  }
}
