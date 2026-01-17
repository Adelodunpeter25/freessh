import { useState, useEffect, lazy, Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { getLanguageFromFilename } from '@/utils/language'
import { FilePreviewHeader } from './FilePreviewHeader'
import { monacoOptions, readOnlyOptions } from './config'

const Editor = lazy(() => import('@monaco-editor/react').then(async (m) => {
  const monaco = await import('monaco-editor')
  m.loader.config({ monaco })
  
  monaco.editor.defineTheme('custom-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#0a0a0a',
    }
  })
  
  monaco.editor.defineTheme('custom-light', {
    base: 'vs',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#ffffff',
    }
  })
  
  return { default: m.default }
}))

interface CodeEditorProps {
  filename: string
  content: string
  onSave?: (content: string) => void
}

export function CodeEditor({ filename, content, onSave }: CodeEditorProps) {
  const [value, setValue] = useState(content)
  const [isEditing, setIsEditing] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [theme, setTheme] = useState(() => 
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'custom-dark' : 'custom-light'
  )
  const language = getLanguageFromFilename(filename)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'custom-dark' : 'custom-light')
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const handleChange = (newValue: string | undefined) => {
    if (newValue !== undefined) {
      setValue(newValue)
      setIsDirty(newValue !== content)
    }
  }

  const handleSave = () => {
    onSave?.(value)
    setIsDirty(false)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setValue(content)
    setIsDirty(false)
    setIsEditing(false)
  }

  return (
    <div className="flex flex-col h-full">
      <FilePreviewHeader
        filename={filename}
        isEditing={isEditing}
        isDirty={isDirty}
        onEdit={() => setIsEditing(true)}
        onSave={handleSave}
        onCancel={handleCancel}
      />
      <div className="flex-1">
        <Suspense fallback={
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        }>
          <Editor
            key={isEditing ? 'edit' : 'readonly'}
            height="100%"
            language={language}
            value={value}
            onChange={handleChange}
            theme={theme}
            options={isEditing ? monacoOptions : readOnlyOptions}
          />
        </Suspense>
      </div>
    </div>
  )
}
