import { backendService } from '../backend'

export const deleteFile = (sessionId: string, path: string): Promise<void> => {
  return backendService.request<void>(
    {
      type: 'sftp:delete',
      session_id: sessionId,
      data: { path }
    },
    'sftp:delete',
    10000,
  )
}

export const mkdir = (sessionId: string, path: string): Promise<void> => {
  return backendService.request<void>(
    {
      type: 'sftp:mkdir',
      session_id: sessionId,
      data: { path }
    },
    'sftp:mkdir',
    10000,
  )
}

export const rename = (sessionId: string, oldPath: string, newPath: string): Promise<void> => {
  return backendService.request<void>(
    {
      type: 'sftp:rename',
      session_id: sessionId,
      data: { old_path: oldPath, new_path: newPath }
    },
    'sftp:rename',
    10000,
  )
}

export const chmod = (sessionId: string, path: string, mode: number): Promise<void> => {
  return backendService.request<void>(
    {
      type: 'sftp:chmod',
      session_id: sessionId,
      data: { path, mode }
    },
    'sftp:chmod',
    10000,
  )
}
