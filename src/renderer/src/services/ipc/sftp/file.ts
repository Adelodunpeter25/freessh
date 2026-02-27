import { backendService } from '../backend'

export const readFile = async (sessionId: string, path: string, binary?: boolean): Promise<string> => {
  const data = await backendService.request<{ content: string }>(
    {
      type: 'sftp:readfile',
      session_id: sessionId,
      data: { path, binary: binary ?? false }
    },
    'sftp:readfile',
    10000,
  )

  return data.content
}

export const writeFile = (sessionId: string, path: string, content: string): Promise<void> => {
  return backendService.request<void>(
    {
      type: 'sftp:writefile',
      session_id: sessionId,
      data: { path, content }
    },
    'sftp:writefile',
    10000,
  )
}
