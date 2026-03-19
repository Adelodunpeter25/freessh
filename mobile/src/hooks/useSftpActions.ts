import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FileInfo } from '@/types'

function isHiddenFile(file: FileInfo): boolean {
  return file.name.startsWith('.')
}

export function useSftpActions(files: FileInfo[]) {
  const [showHidden, setShowHidden] = useState(false)
  const [selectedPaths, setSelectedPaths] = useState<string[]>([])

  const toggleShowHidden = useCallback(() => {
    setShowHidden((current) => !current)
  }, [])

  const visibleFiles = useMemo(() => {
    if (showHidden) return files
    return files.filter((file) => !isHiddenFile(file))
  }, [files, showHidden])

  useEffect(() => {
    const validPaths = new Set(files.map((file) => file.path))
    setSelectedPaths((current) => current.filter((path) => validPaths.has(path)))
  }, [files])

  const toggleSelection = useCallback((path: string) => {
    setSelectedPaths((current) =>
      current.includes(path)
        ? current.filter((selectedPath) => selectedPath !== path)
        : [...current, path],
    )
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedPaths([])
  }, [])

  const isSelected = useCallback(
    (path: string) => selectedPaths.includes(path),
    [selectedPaths],
  )

  const hasSelection = selectedPaths.length > 0
  const canSingleSelectAction = selectedPaths.length === 1

  return {
    showHidden,
    toggleShowHidden,
    visibleFiles,
    selectedPaths,
    selectedCount: selectedPaths.length,
    hasSelection,
    canSingleSelectAction,
    isSelected,
    toggleSelection,
    clearSelection,
  }
}
