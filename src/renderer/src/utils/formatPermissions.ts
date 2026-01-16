export function formatPermissions(mode: number, isDir: boolean): string {
  if (!mode) return '-'
  const perms = mode & 0o777
  const r = (p: number) => (p & 4 ? 'r' : '-')
  const w = (p: number) => (p & 2 ? 'w' : '-')
  const x = (p: number) => (p & 1 ? 'x' : '-')
  const owner = (perms >> 6) & 7
  const group = (perms >> 3) & 7
  const other = perms & 7
  return (isDir ? 'd' : '-') + r(owner) + w(owner) + x(owner) + r(group) + w(group) + x(group) + r(other) + w(other) + x(other)
}
