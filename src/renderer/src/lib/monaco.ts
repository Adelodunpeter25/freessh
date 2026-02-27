import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'

import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'

import 'monaco-editor/esm/vs/language/json/monaco.contribution'
import 'monaco-editor/esm/vs/language/css/monaco.contribution'
import 'monaco-editor/esm/vs/language/html/monaco.contribution'
import 'monaco-editor/esm/vs/language/typescript/monaco.contribution'
import 'monaco-editor/esm/vs/basic-languages/xml/xml.contribution.js'
import 'monaco-editor/esm/vs/basic-languages/python/python.contribution.js'
import 'monaco-editor/esm/vs/basic-languages/markdown/markdown.contribution.js'
import 'monaco-editor/esm/vs/basic-languages/shell/shell.contribution.js'
import 'monaco-editor/esm/vs/basic-languages/dockerfile/dockerfile.contribution.js'
import 'monaco-editor/esm/vs/basic-languages/ini/ini.contribution.js'

if (!monaco.languages.getLanguages().some((lang) => lang.id === 'toml')) {
  monaco.languages.register({ id: 'toml' })

  monaco.languages.setLanguageConfiguration('toml', {
    comments: { lineComment: '#' },
    brackets: [['[', ']'], ['{', '}']],
    autoClosingPairs: [
      { open: '"', close: '"' },
      { open: "'", close: "'" },
      { open: '[', close: ']' },
      { open: '{', close: '}' },
    ],
  })

  monaco.languages.setMonarchTokensProvider('toml', {
    tokenizer: {
      root: [
        [/^\s*\[[^\]]+\]\s*$/, 'type.identifier'],
        [/^\s*[A-Za-z0-9_.-]+\s*(?==)/, 'variable'],
        [/#.*$/, 'comment'],
        [/"([^"\\]|\\.)*"/, 'string'],
        [/'([^'\\]|\\.)*'/, 'string'],
        [/\b(true|false)\b/, 'keyword'],
        [/\b\d+(\.\d+)?\b/, 'number'],
      ],
    },
  })
}

;(self as any).MonacoEnvironment = {
  getWorker(_: string, label: string) {
    if (label === 'json') return new jsonWorker()
    if (label === 'css') return new cssWorker()
    if (label === 'html' || label === 'handlebars' || label === 'razor') return new htmlWorker()
    if (label === 'typescript' || label === 'javascript') return new editorWorker()
    return new editorWorker()
  },
}

export { monaco }
