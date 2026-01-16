import { useState } from 'react'
import Editor from '@monaco-editor/react'
import { getLanguageFromFilename } from '@/utils/language'
import { Button } from '@/components/ui/button'
import { Save } from 'lucide-react'
import { monacoOptions, readOnlyOptions } from './config'

interface CodeEditorProps {
  filename: string
  content: string
  onSave?: (content: string) => void
}

export function CodeEditor({ filename, content, onSave }: CodeEditorProps) {
  const [value, setValue] = useState(content)
  const [isDirty, setIsDirty] = useState(false)
  const language = getLanguageFromFilename(filename)

  const handleChange = (newValue: string | undefined) => {
    if (newValue !== undefined) {
      setValue(newValue)
      setIsDirty(newValue !== content)
    }
  }

  const handleSave = () => {
    onSave?.(value)
    setIsDirty(false)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <span className="text-sm text-muted-foreground">{filename}</span>
        {onSave && (
          <Button size="sm" onClick={handleSave} disabled={!isDirty}>
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
        )}
      </div>
      <div className="flex-1">
        <Editor
          height="100%"
          language={language}
          value={value}
          onChange={handleChange}
          theme="vs-dark"
          options={onSave ? monacoOptions : readOnlyOptions}
        />
      </div>
    </div>
  )
}
