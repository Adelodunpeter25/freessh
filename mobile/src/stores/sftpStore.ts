import { create } from 'zustand'
import * as FileSystem from 'expo-file-system/legacy'
import type { ConnectionConfig, FileInfo } from '@/types'
import { sshService, type SSHClientInstance } from '@/services'
import { connectionService, keyService } from '@/services/crud'

type RawSftpEntry = {
  name?: string
  filename?: string
  longname?: string
  path?: string
  fullPath?: string
  filepath?: string
  size?: number | string
  filesize?: number | string
  fileSize?: number | string  // Added this field
  mode?: number
  permissions?: number | string  // Changed to allow string
  permission?: number
  modificationDate?: number | string  // Added this field
  lastAccess?: number | string  // Added this field
  mod_time?: number
  modified?: number
  mtime?: number
  lastModified?: number
  isDirectory?: number | boolean  // Changed to allow number
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

type ParsedLongname = {
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

type SftpState = {
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
  deleteEntries: (entries: Array<{ path: string; isDir?: boolean }>) => Promise<void>
  copyEntries: (sourcePaths: string[], destinationDirectory?: string) => Promise<void>
  downloadEntries: (remotePaths: string[], localDirectory?: string) => Promise<string[]>
  uploadFiles: (localPaths: string[], remoteDirectory?: string) => Promise<void>
  disconnect: () => void
  closeAllSessions: () => void
}

function normalizePath(path: string): string {
  if (!path || path.trim().length === 0) return '/'
  const normalized = path.replace(/\/+/g, '/')
  if (!normalized.startsWith('/')) return `/${normalized}`
  return normalized
}

function joinPath(base: string, child: string): string {
  const cleanBase = base === '/' ? '' : base.replace(/\/$/, '')
  return normalizePath(`${cleanBase}/${child}`)
}

function parentPath(path: string): string {
  const normalized = normalizePath(path)
  if (normalized === '/') return '/'
  const segments = normalized.split('/').filter(Boolean)
  segments.pop()
  return segments.length ? `/${segments.join('/')}` : '/'
}

function fileNameFromPath(path: string): string {
  const segments = path.split('/').filter(Boolean)
  return segments[segments.length - 1] ?? ''
}

function shellQuote(value: string): string {
  return `'${value.replace(/'/g, `'\"'\"'`)}'`
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
  }
  return fallback
}

function isDirectoryFromMode(mode: number): boolean {
  // POSIX file type bits: directory == 0o040000
  return (mode & 0o170000) === 0o040000
}

function modeStringToNumber(mode: string): number {
  if (!mode || mode.length < 10) return 0
  const perms = mode.slice(1, 10)
  const chunks = [perms.slice(0, 3), perms.slice(3, 6), perms.slice(6, 9)]
  const value = chunks.reduce((acc, part) => {
    const bits =
      (part[0] === 'r' ? 4 : 0) +
      (part[1] === 'w' ? 2 : 0) +
      (part[2] === 'x' || part[2] === 's' || part[2] === 't' ? 1 : 0)
    return (acc << 3) + bits
  }, 0)
  const typeBit = mode[0] === 'd' ? 0o040000 : 0o100000
  return typeBit | value
}

function parseLongname(longname: string): ParsedLongname {
  const trimmed = longname.trim()
  if (!trimmed) return {}
  const parts = trimmed.split(/\s+/)
  if (parts.length < 6) return {}

  const mode = modeStringToNumber(parts[0] ?? '')
  const size = toNumber(parts[4], 0)

  // Common formats: "Mar 3 14:22" or "Mar 3 2025"
  const month = parts[5]
  const day = parts[6]
  const timeOrYear = parts[7]
  let modTime = 0
  if (month && day && timeOrYear) {
    const parsedDate = Date.parse(`${month} ${day} ${timeOrYear}`)
    if (Number.isFinite(parsedDate)) {
      modTime = Math.floor(parsedDate / 1000)
    }
  }

  const name = parts.slice(8).join(' ')
  return {
    mode: mode || undefined,
    size: size || undefined,
    modTime: modTime || undefined,
    name: name || undefined,
  }
}

function toUnixTimestamp(value: unknown): number {
  if (value == null) return 0
  if (typeof value === 'number' && Number.isFinite(value)) {
    // ms timestamp fallback
    return value > 1e12 ? Math.floor(value / 1000) : Math.floor(value)
  }
  if (typeof value === 'string') {
    const asNum = Number(value)
    if (Number.isFinite(asNum)) {
      return asNum > 1e12 ? Math.floor(asNum / 1000) : Math.floor(asNum)
    }
    const parsedDate = Date.parse(value)
    if (Number.isFinite(parsedDate)) return Math.floor(parsedDate / 1000)
  }
  return 0
}

function normalizePrivateKey(privateKey: string): string {
  const normalized = privateKey.replace(/\r\n/g, '\n').trim()
  return normalized.endsWith('\n') ? normalized : `${normalized}\n`
}

function normalizePassphrase(passphrase?: string): string | undefined {
  if (typeof passphrase !== 'string') return undefined
  const normalized = passphrase.trim()
  return normalized.length > 0 ? normalized : undefined
}

function normalizeEntries(entries: unknown, currentPath: string): FileInfo[] {
  if (!Array.isArray(entries)) return []

  const mapped = (entries as RawSftpEntry[]).map((entry) => {
    const longname = (entry.longname ?? '').toString()
    const parsedLongname = parseLongname(longname)
    const name = (
      entry.name ??
      entry.filename ??
      parsedLongname.name ??
      (typeof entry.path === 'string' ? entry.path.split('/').filter(Boolean).pop() : '') ??
      ''
    ).toString()
    const mode = toNumber(
      entry.mode ??
        entry.permissions ??
        entry.permission ??
        entry.attrs?.mode ??
        parsedLongname.mode,
      0,
    )
    const isDir =
      entry.is_dir === true ||
      entry.isDirectory === true ||
      entry.isDirectory === 1 ||
      entry.directory === true ||
      entry.attrs?.isDirectory === true ||
      entry.type === 'directory' ||
      entry.type === 'd' ||
      isDirectoryFromMode(mode) ||
      longname.startsWith('d')

    return {
      name,
      path: entry.path ?? entry.fullPath ?? entry.filepath ?? joinPath(currentPath, name),
      size: toNumber(entry.size ?? entry.filesize ?? entry.fileSize ?? entry.attrs?.size ?? parsedLongname.size, 0),
      mode,
      mod_time: toUnixTimestamp(
        entry.mod_time ??
          entry.modified ??
          entry.mtime ??
          entry.lastModified ??
          entry.modificationDate ??
          entry.attrs?.mtime ??
          parsedLongname.modTime,
      ),
      is_dir: isDir,
    } satisfies FileInfo
  })

  return mapped
    .filter((item) => item.name && item.name !== '.' && item.name !== '..')
    .sort((a, b) => {
      if (a.is_dir !== b.is_dir) return a.is_dir ? -1 : 1
      return a.name.localeCompare(b.name)
    })
}

function getActiveSession(state: SftpState): SftpSession | null {
  if (!state.activeSessionId) return null
  return state.sessions.find((session) => session.id === state.activeSessionId) ?? null
}

function updateSession(
  sessions: SftpSession[],
  id: string,
  updater: (session: SftpSession) => SftpSession,
): SftpSession[] {
  return sessions.map((session) => (session.id === id ? updater(session) : session))
}

function resolveRemotePath(baseDirectory: string, nameOrPath: string): string {
  if (!nameOrPath || nameOrPath.trim().length === 0) return baseDirectory
  if (nameOrPath.startsWith('/')) return normalizePath(nameOrPath)
  return joinPath(baseDirectory, nameOrPath)
}

export const useSftpStore = create<SftpState>((set, get) => ({
  sessions: [],
  activeSessionId: null,
  connectingByConnectionId: {},

  connect: async (connection) => {
    set((state) => ({
      connectingByConnectionId: {
        ...state.connectingByConnectionId,
        [connection.id]: true,
      },
    }))
    const latestConnection = await connectionService.getById(connection.id).catch(() => null)
    const effectiveConnection = latestConnection ?? connection
    const port = effectiveConnection.port ?? 22

    try {
      let client: SSHClientInstance
      if (effectiveConnection.auth_method === 'password') {
        if (!effectiveConnection.password) throw new Error('Missing password')
        client = await sshService.connectWithPassword(
          effectiveConnection.host,
          port,
          effectiveConnection.username,
          effectiveConnection.password,
        )
      } else {
        const candidates: Array<{ key: string; passphrase?: string }> = []

        if (effectiveConnection.key_id) {
          const key = await keyService.getById(effectiveConnection.key_id)
          if (key?.private_key) {
            const preferredPassphrase =
              normalizePassphrase(effectiveConnection.passphrase) ??
              normalizePassphrase(key.passphrase)
            candidates.push({
              key: normalizePrivateKey(key.private_key),
              passphrase: preferredPassphrase,
            })
            // Fallback for stale/incorrect passphrase: retry same key without passphrase.
            if (preferredPassphrase) {
              candidates.push({
                key: normalizePrivateKey(key.private_key),
                passphrase: undefined,
              })
            }
          }
        }

        if (effectiveConnection.private_key?.trim()) {
          const normalized = normalizePrivateKey(effectiveConnection.private_key)
          const exists = candidates.some((candidate) => candidate.key === normalized)
          if (!exists) {
            candidates.push({
              key: normalized,
              passphrase: normalizePassphrase(effectiveConnection.passphrase),
            })
          }
        }

        if (candidates.length === 0) throw new Error('Missing private key')

        let lastError: unknown
        let connectedClient: SSHClientInstance | null = null
        for (const candidate of candidates) {
          try {
            connectedClient = await sshService.connectWithKey(
              effectiveConnection.host,
              port,
              effectiveConnection.username,
              candidate.key,
              candidate.passphrase,
            )
            break
          } catch (error) {
            lastError = error
          }
        }

        if (!connectedClient) {
          throw lastError instanceof Error ? lastError : new Error('Failed to authenticate with private key')
        }

        client = connectedClient
      }

      await sshService.connectSftp(client)
      const rootPath = '/'
      const results = await sshService.sftpLs(client, rootPath)
      const files = normalizeEntries(results, rootPath)
      const id = `${connection.id}-${Date.now()}`
      const session: SftpSession = {
        id,
        connectionName: effectiveConnection.name,
        client,
        currentPath: rootPath,
        files,
        loading: false,
        connected: true,
        error: null,
      }

      set((state) => ({
        sessions: [...state.sessions, session],
        activeSessionId: id,
      }))
    } catch (error) {
      throw error
    } finally {
      set((state) => {
        const next = { ...state.connectingByConnectionId }
        delete next[connection.id]
        return { connectingByConnectionId: next }
      })
    }
  },

  setActiveSession: (id) => {
    set((state) => {
      if (!state.sessions.some((session) => session.id === id)) return state
      return { activeSessionId: id }
    })
  },

  closeSession: (id) => {
    const target = get().sessions.find((session) => session.id === id)
    if (target) {
      try {
        sshService.disconnect(target.client)
      } catch (error) {
        console.warn('[SFTP] Disconnect failed:', error)
      }
    }

    set((state) => {
      const nextSessions = state.sessions.filter((session) => session.id !== id)
      let nextActiveSessionId = state.activeSessionId

      if (state.activeSessionId === id) {
        nextActiveSessionId = nextSessions.length > 0 ? nextSessions[nextSessions.length - 1].id : null
      }

      return {
        sessions: nextSessions,
        activeSessionId: nextActiveSessionId,
      }
    })
  },

  listDirectory: async (path) => {
    const state = get()
    const active = getActiveSession(state)
    if (!active) return

    const targetPath = normalizePath(path ?? active.currentPath)
    set((current) => ({
      sessions: updateSession(current.sessions, active.id, (session) => ({
        ...session,
        loading: true,
        error: null,
      })),
    }))
    try {
      const results = await sshService.sftpLs(active.client, targetPath)
      const files = normalizeEntries(results, targetPath)
      set((current) => ({
        sessions: updateSession(current.sessions, active.id, (session) => ({
          ...session,
          files,
          currentPath: targetPath,
          loading: false,
          connected: true,
          error: null,
        })),
      }))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load directory'
      set((current) => ({
        sessions: updateSession(current.sessions, active.id, (session) => ({
          ...session,
          loading: false,
          error: message,
        })),
      }))
      throw error
    }
  },

  openFolder: async (path) => {
    await get().listDirectory(path)
  },

  goUp: async () => {
    const active = getActiveSession(get())
    if (!active) return
    await get().listDirectory(parentPath(active.currentPath))
  },

  createFolder: async (name, parentPathArg) => {
    const active = getActiveSession(get())
    if (!active) throw new Error('No active SFTP session')
    const parent = normalizePath(parentPathArg ?? active.currentPath)
    const folderPath = resolveRemotePath(parent, name)
    await sshService.sftpMkdir(active.client, folderPath)
    await get().listDirectory(parent)
  },

  renameEntry: async (oldPath, newNameOrPath) => {
    const active = getActiveSession(get())
    if (!active) throw new Error('No active SFTP session')
    const oldNormalized = normalizePath(oldPath)
    const parent = parentPath(oldNormalized)
    const nextPath = resolveRemotePath(parent, newNameOrPath)
    await sshService.sftpRename(active.client, oldNormalized, nextPath)
    await get().listDirectory(active.currentPath)
  },

  deleteEntries: async (entries) => {
    const active = getActiveSession(get())
    if (!active) throw new Error('No active SFTP session')
    if (!entries.length) return

    const removeRecursive = async (path: string, isDirHint?: boolean): Promise<void> => {
      const normalized = normalizePath(path)
      const known = active.files.find((file) => file.path === normalized)
      const isDirectory = isDirHint ?? known?.is_dir ?? false
      if (!isDirectory) {
        await sshService.sftpRm(active.client, normalized)
        return
      }

      const childrenRaw = await sshService.sftpLs(active.client, normalized)
      const children = normalizeEntries(childrenRaw, normalized)
      for (const child of children) {
        await removeRecursive(child.path, child.is_dir)
      }
      await sshService.sftpRmdir(active.client, normalized)
    }

    for (const entry of entries) {
      await removeRecursive(entry.path, entry.isDir)
    }
    await get().listDirectory(active.currentPath)
  },

  copyEntries: async (sourcePaths, destinationDirectory) => {
    const active = getActiveSession(get())
    if (!active) throw new Error('No active SFTP session')
    if (!sourcePaths.length) return

    const destination = normalizePath(destinationDirectory ?? active.currentPath)
    for (const sourcePath of sourcePaths) {
      const source = normalizePath(sourcePath)
      const command = `cp -R -- ${shellQuote(source)} ${shellQuote(destination)}`
      await sshService.execute(active.client, command)
    }
    await get().listDirectory(destination)
  },

  downloadEntries: async (remotePaths, localDirectory) => {
    const active = getActiveSession(get())
    if (!active) throw new Error('No active SFTP session')
    if (!remotePaths.length) return []

    const baseDirectory =
      localDirectory ??
      (FileSystem.documentDirectory
        ? `${FileSystem.documentDirectory}freessh-downloads/`
        : null)
    if (!baseDirectory) throw new Error('No writable local directory available')

    await FileSystem.makeDirectoryAsync(baseDirectory, { intermediates: true })
    const downloadedPaths: string[] = []
    for (const remotePath of remotePaths) {
      const name = fileNameFromPath(remotePath) || `download-${Date.now()}`
      const localPath = `${baseDirectory.replace(/\/+$/, '')}/${name}`
      await sshService.sftpDownload(active.client, normalizePath(remotePath), localPath)
      downloadedPaths.push(localPath)
    }
    return downloadedPaths
  },

  uploadFiles: async (localPaths, remoteDirectory) => {
    const active = getActiveSession(get())
    if (!active) throw new Error('No active SFTP session')
    if (!localPaths.length) return

    const remoteBase = normalizePath(remoteDirectory ?? active.currentPath)
    for (const localPath of localPaths) {
      const name = fileNameFromPath(localPath)
      if (!name) continue
      const remotePath = resolveRemotePath(remoteBase, name)
      await sshService.sftpUpload(active.client, localPath, remotePath)
    }
    await get().listDirectory(remoteBase)
  },

  disconnect: () => {
    const active = getActiveSession(get())
    if (!active) return
    get().closeSession(active.id)
  },

  closeAllSessions: () => {
    const { sessions } = get()
    sessions.forEach((session) => {
      try {
        sshService.disconnect(session.client)
      } catch (error) {
        console.warn('[SFTP] Disconnect failed:', error)
      }
    })
    set({
      sessions: [],
      activeSessionId: null,
    })
  },
}))
