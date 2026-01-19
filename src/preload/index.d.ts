declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        send: (channel: string, ...args: any[]) => void
        on: (channel: string, func: (...args: any[]) => void) => () => void
        once: (channel: string, func: (...args: any[]) => void) => void
        invoke: (channel: string, ...args: any[]) => Promise<any>
      }
      process: {
        platform: string
        env: Record<string, string | undefined>
      }
    }
    api: unknown
  }
}
