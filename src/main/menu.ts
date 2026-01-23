import { app, Menu, BrowserWindow, shell } from 'electron'

export function createMenu(): void {
  const isMac = process.platform === 'darwin'

  const template: Electron.MenuItemConstructorOptions[] = [
    // App menu (macOS only)
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' as const },
        { type: 'separator' as const },
        {
          label: 'Check for Updates...',
          click: () => {
            BrowserWindow.getFocusedWindow()?.webContents.send('menu:check-updates')
          }
        },
        { type: 'separator' as const },
        {
          label: 'Settings...',
          accelerator: 'Cmd+,',
          click: () => {
            BrowserWindow.getFocusedWindow()?.webContents.send('menu:open-settings')
          }
        },
        { type: 'separator' as const },
        { role: 'services' as const },
        { type: 'separator' as const },
        { role: 'hide' as const },
        { role: 'hideOthers' as const },
        { role: 'unhide' as const },
        { type: 'separator' as const },
        { role: 'quit' as const }
      ]
    }] : []),

    // File menu
    {
      label: 'File',
      submenu: [
        {
          label: 'New Connection',
          accelerator: 'CmdOrCtrl+T',
          click: () => {
            BrowserWindow.getFocusedWindow()?.webContents.send('menu:new-connection')
          }
        },
        {
          label: 'Close Tab',
          accelerator: 'CmdOrCtrl+W',
          click: () => {
            BrowserWindow.getFocusedWindow()?.webContents.send('menu:close-tab')
          }
        },
        { type: 'separator' as const },
        {
          label: 'Close Window',
          accelerator: 'CmdOrCtrl+Shift+W',
          role: 'close' as const
        },
        // Add Check for Updates on Windows/Linux
        ...(!isMac ? [
          { type: 'separator' as const },
          {
            label: 'Check for Updates...',
            click: () => {
              BrowserWindow.getFocusedWindow()?.webContents.send('menu:check-updates')
            }
          }
        ] : [])
      ]
    },

    // View menu
    {
      label: 'View',
      submenu: [
        { role: 'reload' as const },
        { role: 'toggleDevTools' as const },
        { type: 'separator' as const },
        { role: 'resetZoom' as const },
        { role: 'zoomIn' as const },
        { role: 'zoomOut' as const },
        { type: 'separator' as const },
        { role: 'togglefullscreen' as const }
      ]
    },

    // Help menu
    {
      role: 'help' as const,
      submenu: [
        {
          label: 'Keyboard Shortcuts',
          accelerator: 'CmdOrCtrl+?',
          click: () => {
            BrowserWindow.getFocusedWindow()?.webContents.send('menu:show-shortcuts')
          }
        },
        { type: 'separator' as const },
        {
          label: 'Documentation',
          click: async () => {
            await shell.openExternal('https://github.com/Adelodunpeter25/freessh')
          }
        },
        {
          label: 'Report Issue',
          click: async () => {
            await shell.openExternal('https://github.com/Adelodunpeter25/freessh/issues')
          }
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}
