export const TERM_DEFAULTS = [
  'xterm-256color',
  'xterm',
  'screen-256color',
  'screen',
  'vt100',
  'linux',
  'ansi',
] as const

export const CUSTOM_TERM_VALUE = '__custom__'
export const DEFAULT_TERM_VALUE = '__default__'

export function isKnownTermValue(term?: string): boolean {
  if (!term) return false
  const normalized = term.trim().toLowerCase()
  return TERM_DEFAULTS.some((value) => value.toLowerCase() === normalized)
}
