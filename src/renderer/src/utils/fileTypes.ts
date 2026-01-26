export function getLanguageFromFilename(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  const name = filename.toLowerCase()

  // Config files by name
  if (name === '.bashrc' || name === '.zshrc' || name === '.profile') return 'shell'
  if (name === '.vimrc') return 'vim'
  if (name === '.gitignore' || name === '.dockerignore') return 'plaintext'
  if (name === 'dockerfile') return 'dockerfile'
  if (name === 'makefile') return 'makefile'

  const extMap: Record<string, string> = {
    // Shell
    sh: 'shell',
    bash: 'shell',
    zsh: 'shell',
    fish: 'shell',
    
    // Config
    json: 'json',
    yaml: 'yaml',
    yml: 'yaml',
    toml: 'toml',
    ini: 'ini',
    conf: 'ini',
    cfg: 'ini',
    env: 'plaintext',
    
    // Web
    html: 'html',
    css: 'css',
    js: 'javascript',
    ts: 'typescript',
    
    // Python
    py: 'python',
    
    // Markup
    md: 'markdown',
    xml: 'xml',
    
    // Logs
    log: 'plaintext',
    txt: 'plaintext',
  }

  return extMap[ext] || 'plaintext'
}

export function isImageFile(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  return ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'ico', 'bmp'].includes(ext)
}

export function isTextFile(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  const name = filename.toLowerCase()
  const textExts = [
    'txt', 'md', 'json', 'yaml', 'yml', 'toml', 'ini', 'conf', 'cfg',
    'sh', 'bash', 'zsh', 'py', 'js', 'ts', 'html', 'css', 'xml',
    'log', 'env', 'gitignore', 'dockerignore'
  ]
  return textExts.includes(ext) || filename.startsWith('.') || name === 'dockerfile' || name === 'makefile'
}

export function shouldOpenInDefaultApp(filename: string): boolean {
  // Text files open in built-in editor
  // Images and other files open in default app
  return !isTextFile(filename)
}
