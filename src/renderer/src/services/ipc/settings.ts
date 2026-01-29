import { backendService } from './backend'
import { Settings } from '@/types/settings'

export const settingsService = {
  get(): Promise<Settings> {
    return new Promise((resolve) => {
      const handler = (msg: any) => {
        backendService.off('settings:get')
        resolve(msg.data)
      }
      backendService.on('settings:get', handler)
      backendService.send({ type: 'settings:get' })
    })
  },

  update(settings: Settings): void {
    backendService.send({
      type: 'settings:update',
      data: settings
    })
  }
}
