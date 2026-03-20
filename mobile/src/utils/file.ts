export const MAX_SYNTAX_HIGHLIGHT_SIZE = 100 * 1024; // 100 KB
export const MAX_PREVIEW_SIZE = 2 * 1024 * 1024; // 2 MB

export function getFileExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf(".");
  // Handle files with no extension or hidden files like .bashrc
  if (lastDotIndex <= 0 || lastDotIndex === filename.length - 1) {
    return "";
  }
  return filename.slice(lastDotIndex + 1).toLowerCase();
}

export function isTextFile(filename: string): boolean {
  const ext = getFileExtension(filename);
  const name = filename.toLowerCase();

  // Common text file extensions
  const textExtensions = new Set([
    "txt", "md", "csv", "json", "yaml", "yml", "xml", "html", "css", "js", "ts", "jsx", "tsx",
    "py", "rb", "php", "java", "go", "rs", "c", "cpp", "h", "hpp", "sh", "bash", "zsh", "fish",
    "ini", "cfg", "conf", "config", "log", "env", "pub", "pem", "crt", "key"
  ]);

  // Exact file names that are usually text
  const exactNames = new Set([
    "dockerfile", "makefile", "cmakelists.txt", "package.json", "gemfile",
    "rakefile", ".gitignore", ".env", ".bashrc", ".zshrc", ".bash_profile",
    ".profile", "id_rsa", "id_ed25519", "known_hosts", "authorized_keys"
  ]);

  if (textExtensions.has(ext)) return true;
  if (exactNames.has(name)) return true;
  return false;
}

export function isLargeFile(sizeBytes: number): boolean {
  return sizeBytes > MAX_PREVIEW_SIZE;
}

export function isTooLargeForSyntaxHighlighting(sizeBytes: number): boolean {
  return sizeBytes > MAX_SYNTAX_HIGHLIGHT_SIZE;
}

export function getLanguageForFile(filename: string): string {
  const ext = getFileExtension(filename);
  const name = filename.toLowerCase();

  const langMap: Record<string, string> = {
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    py: "python",
    rb: "ruby",
    json: "json",
    yml: "yaml",
    yaml: "yaml",
    html: "html",
    css: "css",
    md: "markdown",
    sh: "bash",
    bash: "bash",
    zsh: "bash",
    fish: "bash",
    go: "go",
    rs: "rust",
    java: "java",
    c: "c",
    cpp: "cpp",
    h: "c",
    xml: "xml",
    sql: "sql",
  };

  if (langMap[ext]) return langMap[ext];

  if (name.includes("bash") || name.includes("zsh") || name.includes("profile")) {
    return "bash";
  }

  return "text";
}
