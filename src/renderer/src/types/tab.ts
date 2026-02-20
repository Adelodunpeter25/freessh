export type TabType = 'terminal' | 'sftp' | 'log' | 'workspace'
export type WorkspaceTabMode = 'picker' | 'workspace'

export interface Tab {
  id: string
  sessionId: string
  title: string
  type: TabType
  workspaceMode?: WorkspaceTabMode
  workspaceConnectionIds?: string[]
  workspaceSessionIds?: string[]
  workspaceActiveSessionId?: string
  workspacePinnedSessionIds?: string[]
  workspaceSplitDirection?: 'horizontal' | 'vertical'
  isPinned?: boolean
  logContent?: string
}
