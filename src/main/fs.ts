import { ipcMain, dialog } from 'electron'
import * as fs from 'fs'
import * as path from 'path'

export function setupFileSystemHandlers(): void {
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

  ipcMain.handle('shell:openPath', async (_event, filePath: string) => {
    const { shell } = require('electron')
    return shell.openPath(filePath)
  })

  ipcMain.handle('fs:getTempDir', async () => {
    const { app } = require('electron')
    return app.getPath('temp')
  })

  ipcMain.handle('path:join', async (_event, ...paths: string[]) => {
    const path = require('path')
    return path.join(...paths)
  })
}
