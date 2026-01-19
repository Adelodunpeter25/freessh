import { contextBridge, ipcRenderer } from 'electron'

// Expose Electron APIs to renderer
const electronAPI = {
  ipcRenderer: {
    send: (channel: string, ...args: any[]) => ipcRenderer.send(channel, ...args),
    on: (channel: string, func: (...args: any[]) => void) => {
      const subscription = (_event: any, ...args: any[]) => func(...args)
      ipcRenderer.on(channel, subscription)
      return () => ipcRenderer.removeListener(channel, subscription)
    },
    once: (channel: string, func: (...args: any[]) => void) => {
      ipcRenderer.once(channel, (_event, ...args) => func(...args))
    },
    invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args)
  },
  process: {
    platform: process.platform,
    env: process.env
  }
}

const api = {}

contextBridge.exposeInMainWorld('electron', electronAPI)
contextBridge.exposeInMainWorld('api', api)
