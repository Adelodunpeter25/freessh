import type { editor } from 'monaco-editor'

export const monacoOptions: editor.IStandaloneEditorConstructionOptions = {
  minimap: { enabled: false },
  fontSize: 13,
  fontFamily: "'JetBrains Mono', monospace",
  lineNumbers: 'on',
  lineNumbersMinChars: 4,
  glyphMargin: false,
  folding: true,
  scrollBeyondLastLine: false,
  wordWrap: 'on',
  automaticLayout: true,
  padding: { top: 8, bottom: 8 },
  scrollbar: {
    verticalScrollbarSize: 8,
    horizontalScrollbarSize: 8,
  },
  renderLineHighlight: 'line',
  cursorBlinking: 'smooth',
  cursorSmoothCaretAnimation: 'on',
  unusualLineTerminators: 'off',
}

export const readOnlyOptions: editor.IStandaloneEditorConstructionOptions = {
  ...monacoOptions,
  readOnly: true,
  domReadOnly: true,
}
