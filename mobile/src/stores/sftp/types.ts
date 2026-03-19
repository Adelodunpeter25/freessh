import type { ConnectionConfig, FileInfo } from '@/types'
import type { SSHClientInstance } from '@/services/ssh/sshService'

export type RawSftpEntry = {
  name?: string
  filename?: string
  longname?: string
  path?: string
  fullPath?: string
  filepath?: string
  size?: number | string
  filesize?: number | string
  fileSize?: number | string
  mode?: number
  permissions?: number | string
  permission?: number
  modificationDate?: number | string
  lastAccess?: number | string
  mod_time?: number
  modified?: number
  mtime?: number
  lastModified?: number
  isDirectory?: number | boolean
  attrs?: {
    size?: number | string
    mode?: number
    mtime?: number
    isDirectory?: boolean
  }
  is_dir?: boolean
  directory?: boolean
  type?: string
}

export type ParsedLongname = {
  mode?: number
  size?: number
  modTime?: number
  name?: string
}

export type SftpSession = {
  id: string
  connectionName: string
  client: SSHClientInstance
  currentPath: string
  files: FileInfo[]
  loading: boolean
  connected: boolean
  error: string | null
}

export type SftpDeleteTarget = {
  path: string
  isDir?: boolean
}

export type SftpState = {
  sessions: SftpSession[]
  activeSessionId: string | null
  connectingByConnectionId: Record<string, boolean>
  connect: (connection: ConnectionConfig) => Promise<void>
  setActiveSession: (id: string) => void
  closeSession: (id: string) => void
  listDirectory: (path?: string) => Promise<void>
  openFolder: (path: string) => Promise<void>
  goUp: () => Promise<void>
  createFolder: (name: string, parentPath?: string) => Promise<void>
  renameEntry: (oldPath: string, newNameOrPath: string) => Promise<void>
  deleteEntries: (entries: SftpDeleteTarget[]) => Promise<void>
  copyEntries: (sourcePaths: string[], destinationDirectory?: string) => Promise<void>
  downloadEntries: (remotePaths: string[], localDirectory?: string) => Promise<string[]>
  uploadFiles: (localPaths: string[], remoteDirectory?: string) => Promise<void>
  disconnect: () => void
  closeAllSessions: () => void
}

