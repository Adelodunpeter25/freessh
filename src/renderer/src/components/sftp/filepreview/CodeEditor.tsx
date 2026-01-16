import { useState } from 'react'
import Editor, { loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import { getLanguageFromFilename } from '@/utils/language'
import { FilePreviewHeader } from './FilePreviewHeader'
import { monacoOptions, readOnlyOptions } from './config'

loader.config({ monaco })

interface CodeEditorProps {
  filename: string
  content: string
  onSave?: (content: string) => void
}

export function CodeEditor({ filename, content, onSave }: CodeEditorProps) {
  const [value, setValue] = useState(content)
  const [isEditing, setIsEditing] = useState(false)
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
        <Editor
          height="100%"
          language={language}
          value={value}
          onChange={handleChange}
          theme="vs-dark"
          options={isEditing ? monacoOptions : readOnlyOptions}
        />
      </div>
    </div>
  )
}
