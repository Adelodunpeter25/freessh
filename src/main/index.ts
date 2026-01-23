import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { spawn, ChildProcess } from 'child_process'
import { createWindow } from './window'
import * as fs from 'fs'
import * as path from 'path'

app.setName('FreeSSH')

let goBackend: ChildProcess | null = null
let stdoutBuffer = ''

// Start Go backend
function startBackend() {
  const isDev = !app.isPackaged
  const binaryName = process.platform === 'win32' ? 'server.exe' : 'server'
  
  const binaryPath = isDev
    ? path.join(process.cwd(), 'backend', 'bin', binaryName)
    : path.join(process.resourcesPath, 'backend', binaryName)

  goBackend = spawn(binaryPath, [], {
    stdio: ['pipe', 'pipe', 'pipe']
  })

  goBackend.stdout?.on('data', (data: Buffer) => {
    stdoutBuffer += data.toString()
    const lines = stdoutBuffer.split('\n')
    stdoutBuffer = lines.pop() || '' // Keep incomplete line in buffer
    
    for (const line of lines) {
      if (!line.trim()) continue
      try {
        const message = JSON.parse(line)
        BrowserWindow.getAllWindows().forEach(win => {
          win.webContents.send('backend:message', message)
        })
      } catch (error) {
        console.error('Failed to parse backend message:', error)
      }
    }
  })

  goBackend.stderr?.on('data', (data: Buffer) => {
    console.error('Backend error:', data.toString())
  })

  goBackend.on('exit', (code) => {
    console.log('Backend exited with code:', code)
    goBackend = null
  })
}

// Send message to Go backend
ipcMain.on('backend:send', (event, message) => {
  if (goBackend && goBackend.stdin) {
    const json = JSON.stringify(message) + '\n'
    goBackend.stdin.write(json)
  }
})

// Local filesystem handlers
ipcMain.handle('fs:readdir', async (_event, dirPath: string) => {
  const entries = await fs.promises.readdir(dirPath, { withFileTypes: true })
  const results = await Promise.all(entries.map(async entry => {
    const fullPath = path.join(dirPath, entry.name)
    const stats = await fs.promises.stat(fullPath).catch(() => null)
    return {
      name: entry.name,
      path: fullPath,
      is_dir: entry.isDirectory(),
      size: stats?.size ?? 0,
      mode: stats?.mode ?? 0,
      mod_time: stats?.mtimeMs ?? 0
    }
  }))
  return results
})

ipcMain.handle('fs:delete', async (_event, filePath: string) => {
  const stat = await fs.promises.stat(filePath)
  if (stat.isDirectory()) {
    await fs.promises.rm(filePath, { recursive: true })
  } else {
    await fs.promises.unlink(filePath)
  }
})

ipcMain.handle('fs:rename', async (_event, oldPath: string, newPath: string) => {
  await fs.promises.rename(oldPath, newPath)
})

ipcMain.handle('fs:mkdir', async (_event, dirPath: string) => {
  await fs.promises.mkdir(dirPath, { recursive: true })
})

ipcMain.handle('fs:readfile', async (_event, filePath: string) => {
  return fs.promises.readFile(filePath, 'utf-8')
})

ipcMain.handle('fs:writefile', async (_event, filePath: string, content: string) => {
  await fs.promises.writeFile(filePath, content, 'utf-8')
})

ipcMain.handle('fs:chmod', async (_event, filePath: string, mode: number) => {
  await fs.promises.chmod(filePath, mode)
})

ipcMain.handle('dialog:openFile', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'SSH Keys', extensions: ['pem', 'key', 'pub'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  })
  
  if (result.canceled || result.filePaths.length === 0) {
    return null
  }
  
  const filePath = result.filePaths[0]
  const content = await fs.promises.readFile(filePath, 'utf-8')
  return { path: filePath, content }
})

app.whenReady().then(() => {
  ipcMain.on('ping', () => console.log('pong'))

  startBackend()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (goBackend) {
    goBackend.kill()
  }
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
