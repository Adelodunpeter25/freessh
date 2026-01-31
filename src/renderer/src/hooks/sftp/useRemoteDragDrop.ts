import { useCallback } from 'react'
import { FileInfo } from '../../types'
import { isRemoteToRemote } from '../../utils/remoteTransferDetector'

interface UseRemoteDragDropProps {
  sourcePanelType: 'local' | 'remote'
  destPanelType: 'local' | 'remote'
  sourceSessionId: string | null
  destSessionId: string | null
  onRemoteTransfer: (
    sourceSessionId: string,
    destSessionId: string,
    sourcePaths: string[],
    destDir: string
  ) => Promise<void>
}

export const useRemoteDragDrop = ({
  sourcePanelType,
  destPanelType,
  sourceSessionId,
  destSessionId,
  onRemoteTransfer
}: UseRemoteDragDropProps) => {
  const handleDrop = useCallback(async (files: FileInfo[], targetPath: string) => {
    if (!isRemoteToRemote(sourcePanelType, destPanelType)) {
      return false
    }

    if (!sourceSessionId || !destSessionId) {
      return false
    }

    const sourcePaths = files.map(f => f.path)
    await onRemoteTransfer(sourceSessionId, destSessionId, sourcePaths, targetPath)
    return true
  }, [sourcePanelType, destPanelType, sourceSessionId, destSessionId, onRemoteTransfer])

  return {
    handleDrop,
    isRemoteToRemote: isRemoteToRemote(sourcePanelType, destPanelType)
  }
}
