import { useState } from 'react'
import { FileInfo } from '@/types'

export const useDragDrop = (onDrop?: (files: FileInfo[], targetPath: string) => void, currentPath?: string) => {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "copy"
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const data = e.dataTransfer.getData("application/json")
    if (data && onDrop && currentPath) {
      const droppedFiles = JSON.parse(data) as FileInfo[]
      onDrop(droppedFiles, currentPath)
    }
  }

  return {
    isDragOver,
    dragProps: {
      onDragOver: handleDragOver,
      onDragEnter: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    }
  }
}
