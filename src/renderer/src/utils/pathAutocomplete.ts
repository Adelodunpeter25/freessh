import { FileInfo } from '@/types'

export function getParentPath(path: string): string {
  if (!path || path === '/') return '/'
  const parts = path.split('/').filter(Boolean)
  parts.pop()
  return '/' + parts.join('/')
}

export function getBasename(path: string): string {
  if (!path || path === '/') return ''
  const parts = path.split('/').filter(Boolean)
  return parts[parts.length - 1] || ''
}

export function filterSuggestions(files: FileInfo[], prefix: string): FileInfo[] {
  if (!prefix) return files
  const lower = prefix.toLowerCase()
  return files.filter(f => f.name.toLowerCase().startsWith(lower))
}

export function buildFullPath(parentPath: string, name: string): string {
  if (parentPath === '/') return '/' + name
  return parentPath + '/' + name
}
