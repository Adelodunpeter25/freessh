import { useState, useCallback, useMemo } from "react";
import { useSFTP, useMultiSelect, useBulkOperations } from "@/hooks";
import { useLocalFiles } from "@/hooks";
import { FileInfo } from "@/types";
import { useSessionStore } from "@/stores/sessionStore";
import { useConnectionStore } from "@/stores/connectionStore";
import { connectionService } from "@/services/ipc";

export const useSFTPBrowserState = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [selectedRemote, setSelectedRemote] = useState<FileInfo | null>(null);
  const [selectedLocal, setSelectedLocal] = useState<FileInfo | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<{ file: FileInfo; isRemote: boolean } | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [bulkDeleteContext, setBulkDeleteContext] = useState<{ count: number; isRemote: boolean } | null>(null);
  const [showingSelector, setShowingSelector] = useState<'left' | 'right' | null>(null);
  const [connectingConnectionId, setConnectingConnectionId] = useState<string | null>(null);
  
  // Panel types and session IDs
  const [leftPanelType, setLeftPanelType] = useState<'local' | 'remote'>('local');
  const [leftSessionId, setLeftSessionId] = useState<string | null>(null);
  const [rightPanelType, setRightPanelType] = useState<'local' | 'remote'>('remote');
  const [rightSessionId, setRightSessionId] = useState<string | null>(null);

  const sftp = useSFTP(sessionId);
  const leftSftp = useSFTP(leftSessionId);
  const rightSftp = useSFTP(rightSessionId);
  const local = useLocalFiles();
  const leftLocal = useLocalFiles();
  const rightLocal = useLocalFiles();
  
  const remoteMultiSelect = useMultiSelect();
  const localMultiSelect = useMultiSelect();
  const leftMultiSelect = useMultiSelect();
  const rightMultiSelect = useMultiSelect();
  // Get data for each panel based on type
  const leftData = leftPanelType === 'local' 
    ? { files: leftLocal.files, currentPath: leftLocal.currentPath, loading: leftLocal.loading }
    : { files: leftSftp.files, currentPath: leftSftp.currentPath, loading: leftSftp.loading };
    
  const rightData = rightPanelType === 'local'
    ? { files: rightLocal.files, currentPath: rightLocal.currentPath, loading: rightLocal.loading }
    : { files: rightSftp.files, currentPath: rightSftp.currentPath, loading: rightSftp.loading };

  const bulkOps = useBulkOperations(sessionId, sftp.currentPath, () => {
    sftp.listFiles(sftp.currentPath)
    remoteMultiSelect.clearSelection()
  });

  const transferActive = useMemo(() => 
    sftp.transfers.some(t => t.status !== 'completed' && t.status !== 'failed'),
    [sftp.transfers]
  );

  const handleUploadDrop = useCallback(async (files: FileInfo[], targetPath: string) => {
    const localPaths = files.map(f => f.path)
    await bulkOps.bulkUpload(localPaths, targetPath)
    await sftp.listFiles(targetPath)
  }, [bulkOps, sftp])

  const handleDownloadDrop = useCallback(async (files: FileInfo[], targetPath: string) => {
    const remotePaths = files.map(f => f.path)
    await bulkOps.bulkDownload(remotePaths, targetPath)
    local.refresh()
  }, [bulkOps, local])

  const handleBulkDelete = () => {
    const count = remoteMultiSelect.selectedItems.size
    setBulkDeleteContext({ count, isRemote: true })
    setShowBulkDeleteConfirm(true)
  }

  const handleBulkDownload = async () => {
    const fileNames = Array.from(remoteMultiSelect.selectedItems)
    await bulkOps.bulkDownload(fileNames, local.currentPath)
    local.refresh()
  }

  const handleLocalBulkDelete = () => {
    const count = localMultiSelect.selectedItems.size
    setBulkDeleteContext({ count, isRemote: false })
    setShowBulkDeleteConfirm(true)
  }

  const handleLocalBulkUpload = async () => {
    if (!sessionId) return
    const fileNames = Array.from(localMultiSelect.selectedItems)
    const localPaths = fileNames.map(name => `${local.currentPath}/${name}`)
    
    await bulkOps.bulkUpload(localPaths, sftp.currentPath)
    await sftp.listFiles(sftp.currentPath)
    localMultiSelect.clearSelection()
  }

  const handleConfirmDelete = async () => {
    if (!fileToDelete) return
    
    if (fileToDelete.isRemote) {
      await sftp.deleteFile(fileToDelete.file.path)
    } else {
      await local.deleteFile(fileToDelete.file.path)
    }
    
    setFileToDelete(null)
  }

  const handleConfirmBulkDelete = async () => {
    if (!bulkDeleteContext) return

    if (bulkDeleteContext.isRemote) {
      const fileNames = Array.from(remoteMultiSelect.selectedItems)
      await bulkOps.bulkDelete(fileNames)
    } else {
      const fileNames = Array.from(localMultiSelect.selectedItems)
      for (const fileName of fileNames) {
        const filePath = `${local.currentPath}/${fileName}`
        try {
          await local.deleteFile(filePath)
        } catch (err) {
          console.error(`Failed to delete ${fileName}:`, err)
        }
      }
      local.refresh()
      localMultiSelect.clearSelection()
    }

    setBulkDeleteContext(null)
  }

  const handlePanelSelect = useCallback(async (panel: 'left' | 'right', type: 'local' | 'remote', connectionId?: string) => {
    if (type === 'local') {
      if (panel === 'left') {
        setLeftPanelType('local')
        setLeftSessionId(null)
      } else {
        setRightPanelType('local')
        setRightSessionId(null)
      }
    } else if (type === 'remote' && connectionId) {
      const allSessions = useSessionStore.getState().getAllSessions()
      const existingSession = allSessions.find(s => s.connection?.id === connectionId)
      
      if (existingSession) {
        if (panel === 'left') {
          setLeftPanelType('remote')
          setLeftSessionId(existingSession.session.id)
        } else {
          setRightPanelType('remote')
          setRightSessionId(existingSession.session.id)
        }
      } else {
        const connection = useConnectionStore.getState().connections.find(c => c.id === connectionId)
        if (connection) {
          try {
            setConnectingConnectionId(connectionId)
            const session = await connectionService.connect(connection)
            useSessionStore.getState().addSession(session, connection)
            setConnectingConnectionId(null)
            if (panel === 'left') {
              setLeftPanelType('remote')
              setLeftSessionId(session.id)
            } else {
              setRightPanelType('remote')
              setRightSessionId(session.id)
            }
          } catch (err) {
            setConnectingConnectionId(null)
          }
        }
      }
    }
    
    setShowingSelector(null)
  }, [])

  return {
    sessionId,
    setSessionId,
    selectedRemote,
    setSelectedRemote,
    selectedLocal,
    setSelectedLocal,
    showDeleteConfirm,
    setShowDeleteConfirm,
    fileToDelete,
    setFileToDelete,
    showBulkDeleteConfirm,
    setShowBulkDeleteConfirm,
    bulkDeleteContext,
    showingSelector,
    setShowingSelector,
    leftPanelType,
    leftSessionId,
    leftData,
    leftSftp,
    leftLocal,
    leftMultiSelect,
    rightPanelType,
    rightSessionId,
    rightData,
    rightSftp,
    rightLocal,
    rightMultiSelect,
    connectingConnectionId,
    handlePanelSelect,
    sftp,
    local,
    remoteMultiSelect,
    localMultiSelect,
    transferActive,
    handleUploadDrop,
    handleDownloadDrop,
    handleBulkDelete,
    handleBulkDownload,
    handleLocalBulkDelete,
    handleLocalBulkUpload,
    handleConfirmDelete,
    handleConfirmBulkDelete
  }
}
