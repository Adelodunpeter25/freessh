import { backendService } from './backend'
import type { IPCMessage } from '@/types'
import type {
  WorkspaceStateSaveRequest,
  WorkspaceStateSaveResponse,
  WorkspaceStateLoadRequest,
  WorkspaceStateLoadResponse,
  WorkspaceStateClearRequest,
  WorkspaceStateClearResponse,
} from '@/types/workspace'

function withResponse<T>(
  successType: IPCMessage['type'],
  payload: unknown,
): Promise<T> {
  return backendService.request<T>(
    {
      type: successType,
      data: payload,
    },
    successType,
    10000,
  )
}

export const workspacePersistenceService = {
  save(request: WorkspaceStateSaveRequest): Promise<WorkspaceStateSaveResponse> {
    return withResponse<WorkspaceStateSaveResponse>('workspace_state:save', request)
  },

  load(request: WorkspaceStateLoadRequest = {}): Promise<WorkspaceStateLoadResponse> {
    return withResponse<WorkspaceStateLoadResponse>('workspace_state:load', request)
  },

  clear(request: WorkspaceStateClearRequest = {}): Promise<WorkspaceStateClearResponse> {
    return withResponse<WorkspaceStateClearResponse>('workspace_state:clear', request)
  },
}

