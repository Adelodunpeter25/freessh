import { useEffect } from "react";
import { SFTPPanelsV2 } from "./SFTPPanelsV2";
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
          leftPanelType={state.leftPanelType}
          leftSessionId={state.leftSessionId}
          leftFiles={state.leftData.files}
          leftCurrentPath={state.leftData.currentPath}
          leftLoading={state.leftData.loading}
          leftSftp={state.leftSftp}
          leftLocal={state.leftLocal}
          leftSelectedItems={state.leftMultiSelect.selectedItems}
          onLeftItemSelect={state.leftMultiSelect.handleSelect}
          isLeftItemSelected={state.leftMultiSelect.isSelected}
          onLeftClearSelection={state.leftMultiSelect.clearSelection}
          
          rightPanelType={state.rightPanelType}
          rightSessionId={state.rightSessionId}
          rightFiles={state.rightData.files}
          rightCurrentPath={state.rightData.currentPath}
          rightLoading={state.rightData.loading}
          rightSftp={state.rightSftp}
          rightLocal={state.rightLocal}
          rightSelectedItems={state.rightMultiSelect.selectedItems}
          onRightItemSelect={state.rightMultiSelect.handleSelect}
          isRightItemSelected={state.rightMultiSelect.isSelected}
          onRightClearSelection={state.rightMultiSelect.clearSelection}
          
          selectedLocal={state.selectedLocal}
          selectedRemote={state.selectedRemote}
          onSelectLocal={state.setSelectedLocal}
          onSelectRemote={state.setSelectedRemote}
          transferActive={state.transferActive}
          
          onLeftTitleClick={() => state.setShowingSelector('left')}
          onRightTitleClick={() => state.setShowingSelector('right')}
          showingSelector={state.showingSelector}
          onSelectorClose={() => state.setShowingSelector(null)}
          onPanelSelect={state.handlePanelSelect}
          connectingConnectionId={state.connectingConnectionId}
        />
          leftSessionId={state.leftSessionId}
          rightPanelType={state.rightPanelType}
          rightSessionId={state.rightSessionId}
          connectingConnectionId={state.connectingConnectionId}
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
