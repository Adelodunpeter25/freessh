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
