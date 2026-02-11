import { useCallback, useState } from 'react'
import { workspaceService } from '@renderer/services/ipc/workspace'
import type {
  WorkspaceCreateRequest,
  WorkspaceGetByWindowRequest,
  WorkspaceListTabsRequest,
  WorkspaceMoveTabRequest,
  WorkspaceRegisterTabRequest,
  WorkspaceRegisterWindowRequest,
  WorkspaceRemoveTabRequest,
  WorkspaceRemoveWindowRequest,
} from '@renderer/types/workspace'

export function useWorkspace() {
  const [loading, setLoading] = useState(false)

  const run = useCallback(async <T>(fn: () => Promise<T>): Promise<T> => {
    setLoading(true)
    try {
      return await fn()
    } finally {
      setLoading(false)
    }
  }, [])

  const registerWindow = useCallback(
    (request: WorkspaceRegisterWindowRequest) => run(() => workspaceService.registerWindow(request)),
    [run],
  )

  const removeWindow = useCallback(
    (request: WorkspaceRemoveWindowRequest) => run(() => workspaceService.removeWindow(request)),
    [run],
  )

  const createWorkspace = useCallback(
    (request: WorkspaceCreateRequest) => run(() => workspaceService.create(request)),
    [run],
  )

  const getWorkspaceByWindow = useCallback(
    (request: WorkspaceGetByWindowRequest) => run(() => workspaceService.getByWindow(request)),
    [run],
  )

  const registerTab = useCallback(
    (request: WorkspaceRegisterTabRequest) => run(() => workspaceService.registerTab(request)),
    [run],
  )

  const removeTab = useCallback(
    (request: WorkspaceRemoveTabRequest) => run(() => workspaceService.removeTab(request)),
    [run],
  )

  const listTabs = useCallback(
    (request: WorkspaceListTabsRequest) => run(() => workspaceService.listTabs(request)),
    [run],
  )

  const moveTab = useCallback(
    (request: WorkspaceMoveTabRequest) => run(() => workspaceService.moveTab(request)),
    [run],
  )

  return {
    loading,
    registerWindow,
    removeWindow,
    createWorkspace,
    getWorkspaceByWindow,
    registerTab,
    removeTab,
    listTabs,
    moveTab,
  }
}
