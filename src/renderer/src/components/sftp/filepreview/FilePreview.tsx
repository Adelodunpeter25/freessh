import { isTextFile } from '@/utils/fileTypes'
import { CodeEditor } from './CodeEditor'

interface FilePreviewProps {
  filename: string
  content: string | null
  blobUrl: string | null
  onSave?: (content: string) => void
}

export function FilePreview({ filename, content, blobUrl, onSave }: FilePreviewProps) {
  if (isTextFile(filename) && content !== null) {
    return <CodeEditor filename={filename} content={content} onSave={onSave} />
  }

  return (
    <div className="flex items-center justify-center h-full text-muted-foreground">
      Cannot preview this file type
    </div>
  )
}
