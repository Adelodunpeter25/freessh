export function generateUniqueTitle(baseTitle: string, existingTitles: string[]): string {
  if (!existingTitles.includes(baseTitle)) {
    return baseTitle
  }

  let counter = 1
  let uniqueTitle = `${baseTitle} (${counter})`
  
  while (existingTitles.includes(uniqueTitle)) {
    counter++
    uniqueTitle = `${baseTitle} (${counter})`
  }
  
  return uniqueTitle
}
