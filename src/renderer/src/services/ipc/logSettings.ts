import { backendService } from './backend'
import { LogSettings } from '@/types/logSettings'

export const logSettingsService = {
  get(): Promise<LogSettings> {
    return new Promise((resolve) => {
      const handler = (msg: any) => {
        backendService.off('log_settings:get')
        resolve(msg.data)
      }
      backendService.on('log_settings:get', handler)
      backendService.send({ type: 'log_settings:get' })
    })
  },

  update(settings: LogSettings): void {
    backendService.send({
      type: 'log_settings:update',
      data: settings
    })
  }
}
