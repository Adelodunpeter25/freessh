import { useCallback, useMemo, useState } from 'react'
import type { FileInfo } from '@/types'

function isHiddenFile(file: FileInfo): boolean {
  return file.name.startsWith('.')
}

export function useSftpActions(files: FileInfo[]) {
  const [showHidden, setShowHidden] = useState(false)

  const toggleShowHidden = useCallback(() => {
    setShowHidden((current) => !current)
  }, [])

  const visibleFiles = useMemo(() => {
    if (showHidden) return files
    return files.filter((file) => !isHiddenFile(file))
  }, [files, showHidden])

  return {
    showHidden,
    toggleShowHidden,
    visibleFiles,
  }
}

