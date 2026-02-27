import { backendService } from './backend'
import { LogSettings } from '@/types/logSettings'

export const logSettingsService = {
  get(): Promise<LogSettings> {
    return backendService.request<LogSettings>(
      { type: 'log_settings:get' },
      'log_settings:get',
      10000,
    )
  },

  update(settings: LogSettings): void {
    backendService.send({
      type: 'log_settings:update',
      data: settings
    })
  }
}
