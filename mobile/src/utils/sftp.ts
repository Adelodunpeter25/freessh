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
