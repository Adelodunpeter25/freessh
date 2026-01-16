import { isImageFile, isTextFile } from '@/utils/language'
import { ImagePreview } from './ImagePreview'
import { CodeEditor } from './CodeEditor'

interface FilePreviewProps {
  filename: string
  content: string | null
  blobUrl: string | null
  isLoading: boolean
  onSave?: (content: string) => void
}

export function FilePreview({ filename, content, blobUrl, isLoading, onSave }: FilePreviewProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Loading...
      </div>
    )
  }

  if (isImageFile(filename) && blobUrl) {
    return <ImagePreview src={blobUrl} filename={filename} onClose={onClose} />
  }

  if (isTextFile(filename) && content !== null) {
    return <CodeEditor filename={filename} content={content} onSave={onSave} onClose={onClose} />
  }

  return (
    <div className="flex items-center justify-center h-full text-muted-foreground">
      Cannot preview this file type
    </div>
  )
}
