export function formatMode(mode: number): string {
  if (!mode) return '----------'
  const permissionBits = mode & 0o777
  const triplets = [
    (permissionBits >> 6) & 7,
    (permissionBits >> 3) & 7,
    permissionBits & 7,
  ]
  const toRwx = (bits: number) =>
    `${bits & 4 ? 'r' : '-'}${bits & 2 ? 'w' : '-'}${bits & 1 ? 'x' : '-'}`
  return `-${triplets.map(toRwx).join('')}`
}

export function formatFileSize(bytes: number): string {
  if (bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / 1024 ** index
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`
}

export function formatModifiedTime(timestamp: number): string {
  if (!timestamp) return 'Unknown date'
  const date = new Date(timestamp * 1000)
  const datePart = date.toLocaleDateString()
  const timePart = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return `${datePart} ${timePart}`
}

export function getSftpBreadcrumb(currentPath: string, connectionName: string | null) {
  const breadcrumbParts = currentPath.split('/').filter(Boolean)
  const rootLabel = connectionName ?? 'Home'
  const lastLabel = breadcrumbParts[breadcrumbParts.length - 1] ?? rootLabel
  const canGoUp = currentPath !== '/'
  return { rootLabel, lastLabel, canGoUp }
}
