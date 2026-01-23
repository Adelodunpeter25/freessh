import { ipcMain, BrowserWindow } from 'electron'

export function setupMenuHandlers(): void {
  // Forward menu actions to renderer
  ipcMain.on('menu:new-connection', (event) => {
    event.sender.send('menu:new-connection')
  })

  ipcMain.on('menu:close-tab', (event) => {
    event.sender.send('menu:close-tab')
  })

  ipcMain.on('menu:open-settings', (event) => {
    event.sender.send('menu:open-settings')
  })

  ipcMain.on('menu:show-shortcuts', (event) => {
    event.sender.send('menu:show-shortcuts')
  })

  ipcMain.on('menu:check-updates', (event) => {
    event.sender.send('menu:check-updates')
  })
}
