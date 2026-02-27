import { backendService } from './backend'
import type { IPCMessage } from '@/types'
import type {
  WorkspaceCreateRequest,
  WorkspaceCreateResponse,
  WorkspaceGetByWindowRequest,
  WorkspaceGetByWindowResponse,
  WorkspaceListTabsRequest,
  WorkspaceListTabsResponse,
  WorkspaceMoveTabRequest,
  WorkspaceMoveTabResponse,
  WorkspaceRegisterTabRequest,
  WorkspaceRegisterWindowRequest,
  WorkspaceRemoveTabRequest,
  WorkspaceRemoveWindowRequest,
  WorkspaceStatusResponse,
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

export const workspaceService = {
  registerWindow(request: WorkspaceRegisterWindowRequest): Promise<WorkspaceStatusResponse> {
    return withResponse<WorkspaceStatusResponse>('workspace:register_window', request)
  },

  removeWindow(request: WorkspaceRemoveWindowRequest): Promise<WorkspaceStatusResponse> {
    return withResponse<WorkspaceStatusResponse>('workspace:remove_window', request)
  },

  create(request: WorkspaceCreateRequest): Promise<WorkspaceCreateResponse> {
    return withResponse<WorkspaceCreateResponse>('workspace:create', request)
  },

  getByWindow(request: WorkspaceGetByWindowRequest): Promise<WorkspaceGetByWindowResponse> {
    return withResponse<WorkspaceGetByWindowResponse>('workspace:get_by_window', request)
  },

  registerTab(request: WorkspaceRegisterTabRequest): Promise<WorkspaceStatusResponse> {
    return withResponse<WorkspaceStatusResponse>('workspace:register_tab', request)
  },

  removeTab(request: WorkspaceRemoveTabRequest): Promise<WorkspaceStatusResponse> {
    return withResponse<WorkspaceStatusResponse>('workspace:remove_tab', request)
  },

  listTabs(request: WorkspaceListTabsRequest): Promise<WorkspaceListTabsResponse> {
    return withResponse<WorkspaceListTabsResponse>('workspace:list_tabs', request)
  },

  moveTab(request: WorkspaceMoveTabRequest): Promise<WorkspaceMoveTabResponse> {
    return withResponse<WorkspaceMoveTabResponse>('workspace:move_tab', request)
  },
}
