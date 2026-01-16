export function formatDate(timestamp: number, isMilliseconds = false): string {
  if (!timestamp) return '-'
  
  const date = new Date(isMilliseconds ? timestamp : timestamp * 1000)
  
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  
  let hours = date.getHours()
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12 || 12
  
  return `${day}/${month}/${year}, ${hours}:${minutes} ${ampm}`
}
