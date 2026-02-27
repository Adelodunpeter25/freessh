export function getLanguageFromFilename(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  const name = filename.toLowerCase()

  // Config files by name
  if (
    name === '.bashrc' ||
    name === '.zshrc' ||
    name === '.profile' ||
    name === '.bash_profile' ||
    name === '.zprofile' ||
    name === '.zshenv' ||
    name === '.bash_aliases'
  ) return 'shell'
  if (name === '.vimrc') return 'vim'
  if (
    name === '.gitignore' ||
    name === '.dockerignore' ||
    name === '.npmrc' ||
    name === '.yarnrc' ||
    name === '.editorconfig'
  ) return 'plaintext'
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
    rc: 'shell',
    properties: 'ini',
    
    // Web
    html: 'html',
    css: 'css',
    scss: 'plaintext',
    sass: 'plaintext',
    less: 'plaintext',
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    
    // Programming languages
    py: 'python',
    rb: 'plaintext',
    pl: 'plaintext',
    php: 'php',
    go: 'go',
    rs: 'plaintext',
    java: 'plaintext',
    c: 'c',
    cpp: 'cpp',
    h: 'c',
    hpp: 'cpp',
    
    // Markup
    md: 'markdown',
    xml: 'xml',
    csv: 'plaintext',
    tsv: 'plaintext',

    // Keys and certs
    pem: 'plaintext',
    crt: 'plaintext',
    key: 'plaintext',
    pub: 'plaintext',

    // Scripts
    bat: 'plaintext',
    ps1: 'powershell',
    psm1: 'powershell',

    // Logs
    log: 'plaintext',
    txt: 'plaintext',
    sql: 'sql',
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
  const textByName = new Set([
    '.bashrc',
    '.zshrc',
    '.profile',
    '.bash_profile',
    '.zprofile',
    '.zshenv',
    '.bash_aliases',
    '.vimrc',
    '.gitignore',
    '.dockerignore',
    '.npmrc',
    '.yarnrc',
    '.editorconfig',
    'dockerfile',
    'makefile',
  ])
  const textExts = [
    'txt', 'md', 'json', 'yaml', 'yml', 'toml', 'ini', 'conf', 'cfg',
    'sh', 'bash', 'zsh', 'py', 'js', 'jsx', 'ts', 'tsx', 'html', 'css', 'scss', 'sass', 'less', 'xml',
    'log', 'env', 'gitignore', 'dockerignore', 'rb', 'pl', 'php', 'go', 'rs', 'java', 'c', 'cpp', 'h', 'hpp',
    'rc', 'properties', 'pem', 'crt', 'key', 'pub', 'sql', 'csv', 'tsv', 'bat', 'ps1', 'psm1'
  ]
  return textByName.has(name) || textExts.includes(ext) || filename.startsWith('.')
}

export function shouldOpenInDefaultApp(filename: string): boolean {
  // Text files open in built-in editor
  // Images and other files open in default app
  return !isTextFile(filename)
}
