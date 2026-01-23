export interface TerminalFont {
  name: string
  family: string
}

export const terminalFonts: TerminalFont[] = [
  { name: 'JetBrains Mono', family: '"JetBrains Mono", monospace' },
  { name: 'Fira Code', family: '"Fira Code", monospace' },
  { name: 'Source Code Pro', family: '"Source Code Pro", monospace' },
  { name: 'Consolas', family: 'Consolas, monospace' },
  { name: 'Monaco', family: 'Monaco, monospace' },
  { name: 'Menlo', family: 'Menlo, monospace' },
  { name: 'Courier New', family: '"Courier New", monospace' },
  { name: 'SF Mono', family: '"SF Mono", monospace' },
  { name: 'Cascadia Code', family: '"Cascadia Code", monospace' },
  { name: 'IBM Plex Mono', family: '"IBM Plex Mono", monospace' },
  { name: 'Roboto Mono', family: '"Roboto Mono", monospace' },
  { name: 'Ubuntu Mono', family: '"Ubuntu Mono", monospace' },
  { name: 'Inconsolata', family: 'Inconsolata, monospace' },
  { name: 'System Monospace', family: 'monospace' }
]

export const fontSizes = [10, 11, 12, 13, 14, 15, 16, 18, 20, 22, 24]

export const fontWeights = [
  { name: 'Normal', value: 400 },
  { name: 'Medium', value: 500 },
  { name: 'Semi Bold', value: 600 },
  { name: 'Bold', value: 700 }
]
