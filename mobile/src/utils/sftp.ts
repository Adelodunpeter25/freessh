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
  const pathSegments = currentPath.split('/').filter(Boolean)
  const rootLabel = connectionName ?? 'Home'
  
  // Show only last 2 segments for deep paths
  const displaySegments = pathSegments.length > 2 
    ? ['...', ...pathSegments.slice(-2)]
    : pathSegments
  
  const breadcrumbSegments = [rootLabel, ...displaySegments]
  const fullBreadcrumb = breadcrumbSegments.join(' > ')
  
  // Create clickable paths for navigation
  const clickablePaths = breadcrumbSegments.map((segment, index) => {
    if (segment === '...') return { segment, path: null }
    if (index === 0) return { segment, path: '/' } // Root
    
    // Calculate actual path for this segment
    const segmentIndex = pathSegments.length > 2 
      ? pathSegments.length - (displaySegments.length - index)
      : index - 1
    
    const path = '/' + pathSegments.slice(0, segmentIndex + 1).join('/')
    return { segment, path }
  })
  
  const canGoUp = currentPath !== '/'
  
  return { 
    rootLabel, 
    fullBreadcrumb,
    pathSegments,
    clickablePaths,
    canGoUp 
  }
}
