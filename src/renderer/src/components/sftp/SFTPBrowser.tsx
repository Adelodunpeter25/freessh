import { useEffect } from "react";
import { SFTPPanels } from "./SFTPPanels";
import { SFTPTransferQueue } from "./SFTPTransferQueue";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useFilePreview } from "@/hooks";
import { useKeyboardShortcuts } from "@/hooks";
import { FilePreviewProvider } from "@/contexts/FilePreviewContext";
import { useSFTPBrowserState } from "./SFTPBrowserState";

export function SFTPBrowser() {
  const state = useSFTPBrowserState();
  const preview = useFilePreview(state.sftp.readFile, state.sftp.writeFile);

  useEffect(() => {
    if (state.sessionId) {
      state.sftp.listFiles('/').catch(err => {
        console.error('Failed to list root directory:', err)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.sessionId]);

  useKeyboardShortcuts({
    onRefreshSFTP: () => {
      state.sftp.listFiles(state.sftp.currentPath || '/')
      state.local.refresh()
    },
    onDeleteFile: () => {
      if (state.selectedRemote) {
        state.setFileToDelete({ file: state.selectedRemote, isRemote: true })
        state.setShowDeleteConfirm(true)
      } else if (state.selectedLocal) {
        state.setFileToDelete({ file: state.selectedLocal, isRemote: false })
        state.setShowDeleteConfirm(true)
      }
    },
  })

  return (
    <FilePreviewProvider value={preview}>
      <div className="flex flex-col h-full gap-4 overflow-hidden">
        <SFTPPanels
          sessionId={state.sessionId}
          onSessionChange={state.setSessionId}
          localFiles={state.local.files}
          remoteFiles={state.sftp.files}
          localCurrentPath={state.local.currentPath}
          remoteCurrentPath={state.sftp.currentPath}
          remoteLoading={state.sftp.loading}
          localLoading={state.local.loading}
          selectedLocal={state.selectedLocal}
          selectedRemote={state.selectedRemote}
          onSelectLocal={state.setSelectedLocal}
          onSelectRemote={state.setSelectedRemote}
          transferActive={state.transferActive}
          onLocalDelete={state.local.deleteFile}
          onLocalRename={state.local.rename}
          onLocalChmod={state.local.chmod}
          onLocalMkdir={state.local.mkdir}
          onLocalNavigate={state.local.navigate}
          onLocalRefresh={state.local.refresh}
          onLocalDrop={state.handleDownloadDrop}
          onLocalFetchSuggestions={state.local.listPath}
          onRemoteNavigate={state.sftp.listFiles}
          onRemoteRefresh={() => state.sftp.listFiles(state.sftp.currentPath)}
          onRemoteDelete={state.sftp.deleteFile}
          onRemoteRename={state.sftp.rename}
          onRemoteChmod={state.sftp.chmod}
          onRemoteMkdir={state.sftp.createDirectory}
          onRemoteDrop={state.handleUploadDrop}
          onRemoteDownloadToTemp={state.sftp.downloadToTemp}
          onRemoteFetchSuggestions={state.sftp.listPath}
          localSelectedItems={state.localMultiSelect.selectedItems}
          remoteSelectedItems={state.remoteMultiSelect.selectedItems}
          onLocalItemSelect={state.localMultiSelect.handleSelect}
          onRemoteItemSelect={state.remoteMultiSelect.handleSelect}
          isLocalItemSelected={state.localMultiSelect.isSelected}
          isRemoteItemSelected={state.remoteMultiSelect.isSelected}
          onLocalBulkDelete={state.handleLocalBulkDelete}
          onLocalBulkUpload={state.handleLocalBulkUpload}
          onLocalClearSelection={state.localMultiSelect.clearSelection}
          onRemoteBulkDelete={state.handleBulkDelete}
          onRemoteBulkDownload={state.handleBulkDownload}
          onRemoteClearSelection={state.remoteMultiSelect.clearSelection}
          onLocalTitleClick={() => console.log('Local title clicked')}
          onRemoteTitleClick={() => console.log('Remote title clicked')}
        />
        <SFTPTransferQueue
          transfers={state.sftp.transfers}
          onCancel={state.sftp.cancelTransfer}
          onClearCompleted={state.sftp.clearCompleted}
        />
      </div>
      <ConfirmDialog
        open={state.showDeleteConfirm}
        onOpenChange={state.setShowDeleteConfirm}
        title={state.fileToDelete?.file.is_dir ? "Delete folder" : "Delete file"}
        description={state.fileToDelete ? `Are you sure you want to delete "${state.fileToDelete.file.name}"? This action cannot be undone.` : ''}
        confirmText="Delete"
        destructive
        onConfirm={state.handleConfirmDelete}
      />
      <ConfirmDialog
        open={state.showBulkDeleteConfirm}
        onOpenChange={state.setShowBulkDeleteConfirm}
        title="Delete multiple items"
        description={state.bulkDeleteContext ? `Are you sure you want to delete ${state.bulkDeleteContext.count} item(s)? This action cannot be undone.` : ''}
        confirmText="Delete"
        destructive
        onConfirm={state.handleConfirmBulkDelete}
      />
    </FilePreviewProvider>
  );
}
