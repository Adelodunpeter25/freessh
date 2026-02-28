export type WorkspaceWindowMode = 'primary' | 'workspace'

export interface WorkspaceModel {
  id: string
  window_id: string
  name: string
  created_at: string
  updated_at: string
}

export interface WorkspaceTabModel {
  tab_id: string
  session_id: string
  window_id: string
  is_local: boolean
  created_at: string
  modified_at: string
}

export interface WorkspaceRegisterWindowRequest {
  window_id: string
  mode: WorkspaceWindowMode
}

export interface WorkspaceRemoveWindowRequest {
  window_id: string
}

export interface WorkspaceCreateRequest {
  window_id: string
  name: string
}

export interface WorkspaceGetByWindowRequest {
  window_id: string
}

export interface WorkspaceRegisterTabRequest {
  tab_id: string
  session_id: string
  window_id: string
  is_local: boolean
}

export interface WorkspaceRemoveTabRequest {
  tab_id: string
}

export interface WorkspaceListTabsRequest {
  window_id: string
}

export interface WorkspaceMoveTabRequest {
  tab_id: string
  source_window: string
  target_window: string
  transaction_id?: string
}

export interface WorkspaceCreateResponse {
  workspace: WorkspaceModel
}

export interface WorkspaceGetByWindowResponse {
  workspace: WorkspaceModel
}

export interface WorkspaceListTabsResponse {
  tabs: WorkspaceTabModel[]
}

export interface WorkspaceMoveTabResponse {
  transaction_id: string
  tab_id: string
  source_window: string
  target_window: string
  completed_at: string
}

export interface WorkspaceStatusResponse {
  status: string
}

export interface WorkspaceStateSaveRequest {
  client_state?: Record<string, unknown>
}

export interface WorkspaceStateLoadRequest {}

export interface WorkspaceStateClearRequest {}

export interface WorkspaceStateSnapshotModel {
  workspaces: Record<string, WorkspaceModel>
  window_to_space: Record<string, string>
  tabs: Record<string, WorkspaceTabModel>
  window_mode: Record<string, string>
}

export interface WorkspaceStateModel {
  version: number
  saved_at: string
  snapshot: WorkspaceStateSnapshotModel
  client_state?: Record<string, unknown>
}

export interface WorkspaceStateSaveResponse {
  status: string
  state: WorkspaceStateModel
}

export interface WorkspaceStateLoadResponse {
  found: boolean
  state?: WorkspaceStateModel
}

export interface WorkspaceStateClearResponse {
  status: string
}
