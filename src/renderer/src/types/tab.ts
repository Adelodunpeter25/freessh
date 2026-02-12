export type TabType = 'terminal' | 'sftp' | 'log' | 'workspace'

export interface Tab {
  id: string
  sessionId: string
  title: string
  type: TabType
  isPinned?: boolean
  logContent?: string
}
