import type { FileInfo } from '@/types'
import type { ParsedLongname, RawSftpEntry, SftpSession, SftpState } from './types'

export function normalizePath(path: string): string {
  if (!path || path.trim().length === 0) return '/'
  const normalized = path.replace(/\/+/g, '/')
  if (!normalized.startsWith('/')) return `/${normalized}`
  return normalized
}

export function joinPath(base: string, child: string): string {
  const cleanBase = base === '/' ? '' : base.replace(/\/$/, '')
  return normalizePath(`${cleanBase}/${child}`)
}

export function parentPath(path: string): string {
  const normalized = normalizePath(path)
  if (normalized === '/') return '/'
  const segments = normalized.split('/').filter(Boolean)
  segments.pop()
  return segments.length ? `/${segments.join('/')}` : '/'
}

export function fileNameFromPath(path: string): string {
  const segments = path.split('/').filter(Boolean)
  return segments[segments.length - 1] ?? ''
}

export function resolveRemotePath(baseDirectory: string, nameOrPath: string): string {
  if (!nameOrPath || nameOrPath.trim().length === 0) return baseDirectory
  if (nameOrPath.startsWith('/')) return normalizePath(nameOrPath)
  return joinPath(baseDirectory, nameOrPath)
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
  const month = parts[5]
  const day = parts[6]
  const timeOrYear = parts[7]
  let modTime = 0
  if (month && day && timeOrYear) {
    const parsedDate = Date.parse(`${month} ${day} ${timeOrYear}`)
    if (Number.isFinite(parsedDate)) modTime = Math.floor(parsedDate / 1000)
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

export function normalizePrivateKey(privateKey: string): string {
  const normalized = privateKey.replace(/\r\n/g, '\n').trim()
  return normalized.endsWith('\n') ? normalized : `${normalized}\n`
}

export function normalizePassphrase(passphrase?: string): string | undefined {
  if (typeof passphrase !== 'string') return undefined
  const normalized = passphrase.trim()
  return normalized.length > 0 ? normalized : undefined
}

export function normalizeEntries(entries: unknown, currentPath: string): FileInfo[] {
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

export function getActiveSession(state: SftpState): SftpSession | null {
  if (!state.activeSessionId) return null
  return state.sessions.find((session) => session.id === state.activeSessionId) ?? null
}

export function updateSession(
  sessions: SftpSession[],
  id: string,
  updater: (session: SftpSession) => SftpSession,
): SftpSession[] {
  return sessions.map((session) => (session.id === id ? updater(session) : session))
}

