import { memo, useState, useEffect, useRef } from 'react'
import { Folder, File } from 'lucide-react'
import { FileInfo } from '@/types'
import { FileItemContextMenu } from '@/components/contextmenu'

interface FileItemProps {
  file: FileInfo
  selected: boolean
  multiSelected?: boolean
  onSelect: () => void
  onOpen: () => void
  onDelete: () => Promise<void>
  onRename: (newName: string) => void
  onChmod: (mode: number) => Promise<void>
  draggable?: boolean
  onDragStart?: (e: React.DragEvent) => void
  onClick?: (e: React.MouseEvent) => void
  formattedDate?: string
  formattedPerms?: string
  formattedSize?: string
}

export const FileItem = memo(function FileItem({ 
  file, 
  selected,
  multiSelected = false,
  onSelect, 
  onOpen, 
  onDelete, 
  onRename, 
  onChmod, 
  draggable, 
  onDragStart,
  onClick,
  formattedDate,
  formattedPerms,
  formattedSize
}: FileItemProps) {
  const [isRenaming, setIsRenaming] = useState(false)
  const [newName, setNewName] = useState(file.name)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isRenaming])

  const handleRenameSubmit = () => {
    if (newName.trim() && newName !== file.name) {
      onRename(newName.trim())
    }
    setIsRenaming(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRenameSubmit()
    } else if (e.key === 'Escape') {
      setNewName(file.name)
      setIsRenaming(false)
    }
  }

  const startRename = () => {
    setNewName(file.name)
    setIsRenaming(true)
  }

  return (
    <FileItemContextMenu file={file} onOpen={onOpen} onRename={startRename} onDelete={onDelete} onChmod={onChmod}>
      <div
        className={`grid grid-cols-[1fr_100px_90px_70px] items-center gap-2 px-3 py-2 cursor-pointer hover:bg-accent/50 text-sm ${
          multiSelected ? 'bg-primary/20' : selected ? 'bg-primary/30' : ''
        }`}
        onClick={(e) => {
          onClick?.(e)
          // Only call onSelect for non-modifier clicks (for preview/context menu)
          if (!e.metaKey && !e.ctrlKey && !e.shiftKey) {
            onSelect()
          }
        }}
        onContextMenu={onSelect}
        onDoubleClick={onOpen}
        draggable={draggable && !isRenaming}
        onDragStart={onDragStart}
      >
        <div className="flex items-center gap-2 min-w-0">
          {file.is_dir ? (
            <Folder className="w-4 h-4 text-primary shrink-0" fill="currentColor" />
          ) : (
            <File className="w-4 h-4 text-white shrink-0" fill="currentColor" />
          )}
          {isRenaming ? (
            <input
              ref={inputRef}
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={handleRenameSubmit}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 bg-background border-2 border-primary rounded px-1.5 py-0.5 text-sm outline-none"
            />
          ) : (
            <span className="truncate">{file.name}</span>
          )}
        </div>
        <span className="text-xs text-muted-foreground">{formattedDate}</span>
        <span className="text-xs text-muted-foreground font-mono">{formattedPerms}</span>
        <span className="text-xs text-muted-foreground text-right">{formattedSize}</span>
      </div>
    </FileItemContextMenu>
  )
})
