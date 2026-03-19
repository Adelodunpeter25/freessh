import { create } from 'zustand'
import type { ConnectionConfig, FileInfo } from '@/types'
import { sshService, type SSHClientInstance } from '@/services'
import { keyService } from '@/services/crud'

type RawSftpEntry = {
  name?: string
  filename?: string
  path?: string
  fullPath?: string
  size?: number | string
  mode?: number
  mod_time?: number
  modified?: number
  is_dir?: boolean
  isDirectory?: boolean
  type?: string
}

type SftpState = {
  client: SSHClientInstance | null
  connectionName: string | null
  currentPath: string
  files: FileInfo[]
  loading: boolean
  connected: boolean
  error: string | null
  connect: (connection: ConnectionConfig) => Promise<void>
  listDirectory: (path?: string) => Promise<void>
  openFolder: (path: string) => Promise<void>
  goUp: () => Promise<void>
  disconnect: () => void
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

function normalizeEntries(entries: unknown, currentPath: string): FileInfo[] {
  if (!Array.isArray(entries)) return []

  const mapped = (entries as RawSftpEntry[]).map((entry) => {
    const name = (entry.name ?? entry.filename ?? '').toString()
    const isDir =
      entry.is_dir === true ||
      entry.isDirectory === true ||
      entry.type === 'directory' ||
      entry.type === 'd'

    return {
      name,
      path: entry.path ?? entry.fullPath ?? joinPath(currentPath, name),
      size: Number(entry.size ?? 0),
      mode: Number(entry.mode ?? 0),
      mod_time: Number(entry.mod_time ?? entry.modified ?? 0),
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

export const useSftpStore = create<SftpState>((set, get) => ({
  client: null,
  connectionName: null,
  currentPath: '/',
  files: [],
  loading: false,
  connected: false,
  error: null,

  connect: async (connection) => {
    const existing = get().client
    if (existing) {
      try {
        sshService.disconnect(existing)
      } catch (error) {
        console.warn('[SFTP] Failed to disconnect previous client:', error)
      }
    }

    set({
      loading: true,
      connected: false,
      error: null,
      files: [],
      currentPath: '/',
      connectionName: connection.name,
    })

    const port = connection.port ?? 22

    try {
      let client: SSHClientInstance
      if (connection.auth_method === 'password') {
        if (!connection.password) throw new Error('Missing password')
        client = await sshService.connectWithPassword(
          connection.host,
          port,
          connection.username,
          connection.password,
        )
      } else {
        let privateKey = connection.private_key
        let passphrase = connection.passphrase
        if (!privateKey && connection.key_id) {
          const key = await keyService.getById(connection.key_id)
          privateKey = key?.private_key || ''
          if (!passphrase) passphrase = key?.passphrase
        }
        if (!privateKey) throw new Error('Missing private key')
        client = await sshService.connectWithKey(
          connection.host,
          port,
          connection.username,
          privateKey,
          passphrase,
        )
      }

      await sshService.connectSftp(client)
      set({ client, connected: true, loading: false, error: null })
      await get().listDirectory('/')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to connect to SFTP'
      set({
        client: null,
        connected: false,
        loading: false,
        error: message,
      })
      throw error
    }
  },

  listDirectory: async (path) => {
    const client = get().client
    if (!client) {
      set({ files: [], connected: false, error: 'No SFTP connection' })
      return
    }

    const targetPath = normalizePath(path ?? get().currentPath)
    set({ loading: true, error: null })
    try {
      const results = await sshService.sftpLs(client, targetPath)
      const files = normalizeEntries(results, targetPath)
      set({
        files,
        currentPath: targetPath,
        loading: false,
        connected: true,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load directory'
      set({ loading: false, error: message })
      throw error
    }
  },

  openFolder: async (path) => {
    await get().listDirectory(path)
  },

  goUp: async () => {
    await get().listDirectory(parentPath(get().currentPath))
  },

  disconnect: () => {
    const client = get().client
    if (client) {
      try {
        sshService.disconnect(client)
      } catch (error) {
        console.warn('[SFTP] Disconnect failed:', error)
      }
    }
    set({
      client: null,
      connectionName: null,
      currentPath: '/',
      files: [],
      connected: false,
      loading: false,
      error: null,
    })
  },
}))
