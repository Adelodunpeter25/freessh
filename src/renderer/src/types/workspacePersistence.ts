import type { Tab } from './tab'
import type { WorkspaceStateModel } from './workspace'

export interface PersistedSessionRef {
  connection_id?: string
  is_local: boolean
}

export interface RendererWorkspaceClientState {
  tabs: Tab[]
  active_tab_id: string | null
  main_view?: 'home' | 'sftp' | 'terminal'
  sidebar_tab?: 'connections' | 'keys' | 'known-hosts' | 'port-forward' | 'snippets' | 'logs' | 'settings'
  show_terminal_settings?: boolean
  session_refs: Record<string, PersistedSessionRef>
}

export interface WorkspacePersistenceSaveRequest {
  client_state?: RendererWorkspaceClientState
}

export interface WorkspacePersistenceSaveResponse {
  status: string
  state: WorkspaceStateModel
}

export interface WorkspacePersistenceLoadResponse {
  found: boolean
  state?: WorkspaceStateModel
}

export interface WorkspacePersistenceClearResponse {
  status: string
}

