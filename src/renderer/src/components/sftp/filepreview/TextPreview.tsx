import { useState } from 'react'
import { FilePreviewHeader } from './FilePreviewHeader'

interface TextPreviewProps {
  content: string
  filename: string
  onSave?: (content: string) => void
}

export function TextPreview({ content, filename, onSave }: TextPreviewProps) {
  const [value, setValue] = useState(content)
  const [isEditing, setIsEditing] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const lines = value.split('\n')

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
      <div className="flex-1 overflow-auto font-mono text-sm">
        {isEditing ? (
          <textarea
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              setIsDirty(e.target.value !== content)
            }}
            className="w-full h-full p-4 bg-transparent resize-none outline-none"
          />
        ) : (
          <div className="flex">
            <div className="select-none text-right pr-4 pl-2 text-muted-foreground/50 border-r border-border bg-muted/30">
              {lines.map((_, i) => (
                <div key={i} className="leading-6">{i + 1}</div>
              ))}
            </div>
            <pre className="flex-1 p-2 pl-4 overflow-x-auto">
              {lines.map((line, i) => (
                <div key={i} className="leading-6">{line || ' '}</div>
              ))}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
