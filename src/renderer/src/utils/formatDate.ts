export function formatDate(timestamp: number, isMilliseconds = false): string {
  if (!timestamp) return '-'
  
  const date = new Date(isMilliseconds ? timestamp : timestamp * 1000)
  
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  
  return `${day}/${month}/${year}`
}
