import { useState, useEffect, useCallback, useMemo } from "react";
import { FilePanel } from "./FilePanel";
import { RemotePanel } from "./RemotePanel";
import { TransferQueue } from "./TransferQueue";
import { BulkActionBar } from "./BulkActionBar";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useSFTP, useMultiSelect, useBulkOperations } from "@/hooks";
import { useLocalFiles } from "@/hooks";
import { useFilePreview } from "@/hooks";
import { useKeyboardShortcuts } from "@/hooks";
import { FilePreviewProvider } from "@/contexts/FilePreviewContext";
import { FilePanelProvider } from "@/contexts/FilePanelContext";
import { FileInfo } from "@/types";

export function SFTPBrowser() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [selectedRemote, setSelectedRemote] = useState<FileInfo | null>(null);
  const [selectedLocal, setSelectedLocal] = useState<FileInfo | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<{ file: FileInfo; isRemote: boolean } | null>(null);

  const sftp = useSFTP(sessionId);
  const local = useLocalFiles();
  const preview = useFilePreview(sftp.readFile, sftp.writeFile);
  
  const remoteMultiSelect = useMultiSelect();
  const localMultiSelect = useMultiSelect();
  
  const bulkOps = useBulkOperations(sessionId, sftp.currentPath, () => {
    sftp.listFiles(sftp.currentPath)
    remoteMultiSelect.clearSelection()
  });

  const transferActive = useMemo(() => 
    sftp.transfers.some(t => t.status !== 'completed' && t.status !== 'failed'),
    [sftp.transfers]
  );

  useEffect(() => {
    if (sessionId) {
      sftp.listFiles('/').catch(err => {
        console.error('Failed to list root directory:', err)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const handleUploadDrop = useCallback(async (files: FileInfo[], targetPath: string) => {
    for (const file of files) {
      if (file.is_dir) continue;
      const remotePath = targetPath === "/" ? `/${file.name}` : `${targetPath}/${file.name}`;
      await sftp.upload(file.path, remotePath);
    }
  }, [sftp.upload]);

  const handleDownloadDrop = useCallback(async (files: FileInfo[], targetPath: string) => {
    for (const file of files) {
      if (file.is_dir) continue;
      const localPath = `${targetPath}/${file.name}`;
      await sftp.download(file.path, localPath);
      local.refresh();
    }
  }, [sftp.download, local.refresh]);

  // SFTP keyboard shortcuts
  useKeyboardShortcuts({
    onRefreshSFTP: () => {
      sftp.listFiles(sftp.currentPath || '/')
      local.refresh()
    },
    onDeleteFile: () => {
      if (selectedRemote) {
        setFileToDelete({ file: selectedRemote, isRemote: true })
        setShowDeleteConfirm(true)
      } else if (selectedLocal) {
        setFileToDelete({ file: selectedLocal, isRemote: false })
        setShowDeleteConfirm(true)
      }
    },
  })

  const handleConfirmDelete = async () => {
    if (!fileToDelete) return
    
    if (fileToDelete.isRemote) {
      await sftp.deleteFile(fileToDelete.file.path)
    } else {
      await local.deleteFile(fileToDelete.file.path)
    }
    
    setFileToDelete(null)
  }

  const localContextValue = useMemo(() => ({
    onDelete: local.deleteFile,
    onRename: local.rename,
    onChmod: local.chmod,
    onMkdir: local.mkdir,
    onNavigate: local.navigate,
    onRefresh: local.refresh,
    onDrop: handleDownloadDrop,
    selectedFile: selectedLocal,
    onSelectFile: setSelectedLocal,
    currentPath: local.currentPath,
    loading: local.loading,
    isRemote: false,
    transferActive,
    fetchSuggestions: local.listPath,
    selectedItems: localMultiSelect.selectedItems,
    onItemSelect: localMultiSelect.handleSelect,
    isItemSelected: localMultiSelect.isSelected,
  }), [local, handleDownloadDrop, selectedLocal, transferActive, localMultiSelect]);

  const handleBulkDelete = async () => {
    const fileNames = Array.from(remoteMultiSelect.selectedItems)
    await bulkOps.bulkDelete(fileNames)
  }

  const handleBulkDownload = async () => {
    const fileNames = Array.from(remoteMultiSelect.selectedItems)
    await bulkOps.bulkDownload(fileNames, local.currentPath)
    local.refresh()
  }

  const handleLocalBulkDelete = async () => {
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

  const handleLocalBulkUpload = async () => {
    if (!sessionId) return
    const fileNames = Array.from(localMultiSelect.selectedItems)
    const localPaths = fileNames.map(name => `${local.currentPath}/${name}`)
    
    await bulkOps.bulkUpload(localPaths, sftp.currentPath)
    await sftp.listFiles(sftp.currentPath)
    localMultiSelect.clearSelection()
  }

  return (
    <FilePreviewProvider value={preview}>
      <div className="flex flex-col h-full gap-4 overflow-hidden">
        <div className="flex flex-1 gap-4 overflow-hidden relative">
          <div className="flex-1 h-full overflow-hidden relative">
            <FilePanelProvider value={localContextValue}>
              <FilePanel
                title="Local Files"
                files={local.files}
              />
            </FilePanelProvider>
            {localMultiSelect.selectedItems.size > 1 && (
              <BulkActionBar
                selectedCount={localMultiSelect.selectedItems.size}
                onDelete={handleLocalBulkDelete}
                onDownload={handleLocalBulkUpload}
                onClear={localMultiSelect.clearSelection}
                actionLabel="Upload"
              />
            )}
          </div>
          <div className="flex-1 h-full overflow-hidden relative">
            <RemotePanel
              sessionId={sessionId}
              onSessionChange={setSessionId}
              files={sftp.files}
              currentPath={sftp.currentPath}
              loading={sftp.loading}
              onNavigate={sftp.listFiles}
              onRefresh={() => sftp.listFiles(sftp.currentPath)}
              onDelete={sftp.deleteFile}
              onRename={sftp.rename}
              onChmod={sftp.chmod}
              onMkdir={sftp.createDirectory}
              onDrop={handleUploadDrop}
              onDownloadToTemp={sftp.downloadToTemp}
              selectedFile={selectedRemote}
              onSelectFile={setSelectedRemote}
              transferActive={transferActive}
              fetchSuggestions={sftp.listPath}
              selectedItems={remoteMultiSelect.selectedItems}
              onItemSelect={remoteMultiSelect.handleSelect}
              isItemSelected={remoteMultiSelect.isSelected}
            />
            {remoteMultiSelect.selectedItems.size > 1 && (
              <BulkActionBar
                selectedCount={remoteMultiSelect.selectedItems.size}
                onDelete={handleBulkDelete}
                onDownload={handleBulkDownload}
                onClear={remoteMultiSelect.clearSelection}
              />
            )}
          </div>
        </div>
        {sftp.transfers.length > 0 && (
          <TransferQueue transfers={sftp.transfers} onCancel={sftp.cancelTransfer} onClearCompleted={sftp.clearCompleted} />
        )}
      </div>
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title={fileToDelete?.file.is_dir ? "Delete folder" : "Delete file"}
        description={fileToDelete ? `Are you sure you want to delete "${fileToDelete.file.name}"? This action cannot be undone.` : ''}
        confirmText="Delete"
        destructive
        onConfirm={handleConfirmDelete}
      />
    </FilePreviewProvider>
  );
}
