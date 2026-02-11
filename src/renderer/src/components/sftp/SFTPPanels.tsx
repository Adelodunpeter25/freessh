import { useMemo, useState, useCallback } from "react";
import { FilePanel } from "./FilePanel";
import { BulkActionBar } from "./BulkActionBar";
import { PanelSelector } from "./PanelSelector";
import { FilePanelProvider } from "@/contexts/FilePanelContext";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { FileInfo } from "@/types";
import { isRemoteToRemote } from "@/utils/remoteTransferDetector";
import { useRemoteTransfer, useRemoteDragDrop } from "@/hooks";
import { useSessionStore } from "@/stores/sessionStore";

interface SFTPPanelsProps {
  leftPanelType: 'local' | 'remote';
  leftSessionId: string | null;
  leftFiles: FileInfo[];
  leftCurrentPath: string;
  leftLoading: boolean;
  leftSftp: any;
  leftLocal: any;
  leftSelectedItems: Set<string>;
  onLeftItemSelect: (fileName: string, isMulti: boolean) => void;
  isLeftItemSelected: (fileName: string) => boolean;
  onLeftClearSelection: () => void;
  leftBulkOps: any;
  
  rightPanelType: 'local' | 'remote';
  rightSessionId: string | null;
  rightFiles: FileInfo[];
  rightCurrentPath: string;
  rightLoading: boolean;
  rightSftp: any;
  rightLocal: any;
  rightSelectedItems: Set<string>;
  onRightItemSelect: (fileName: string, isMulti: boolean) => void;
  isRightItemSelected: (fileName: string) => boolean;
  onRightClearSelection: () => void;
  rightBulkOps: any;
  
  selectedLocal: FileInfo | null;
  selectedRemote: FileInfo | null;
  onSelectLocal: (file: FileInfo | null) => void;
  onSelectRemote: (file: FileInfo | null) => void;
  transferActive: boolean;
  
  onLeftTitleClick: () => void;
  onRightTitleClick: () => void;
  showingSelector: 'left' | 'right' | null;
  onSelectorClose: () => void;
  onPanelSelect: (panel: 'left' | 'right', type: 'local' | 'remote', connectionId?: string) => void;
  connectingConnectionId: string | null;
}

export function SFTPPanels(props: SFTPPanelsProps) {
  const [showLeftDeleteConfirm, setShowLeftDeleteConfirm] = useState(false)
  const [showRightDeleteConfirm, setShowRightDeleteConfirm] = useState(false)
  const getSession = useSessionStore((state) => state.getSession)
  
  // Use the first available SFTP setTransfers (prefer left, then right)
  const setTransfers = props.leftPanelType === 'remote' && props.leftSftp?.setTransfers
    ? props.leftSftp.setTransfers
    : props.rightPanelType === 'remote' && props.rightSftp?.setTransfers
    ? props.rightSftp.setTransfers
    : undefined
  
  const { bulkRemoteTransfer } = useRemoteTransfer(() => {
    // Refresh both panels after remote transfer
    if (props.leftPanelType === 'remote') {
      props.leftSftp.listFiles(props.leftCurrentPath)
    }
    if (props.rightPanelType === 'remote') {
      props.rightSftp.listFiles(props.rightCurrentPath)
    }
  }, setTransfers)

  const leftDragDrop = useRemoteDragDrop({
    sourcePanelType: props.rightPanelType,
    destPanelType: props.leftPanelType,
    sourceSessionId: props.rightSessionId,
    destSessionId: props.leftSessionId,
    onRemoteTransfer: bulkRemoteTransfer
  })

  const rightDragDrop = useRemoteDragDrop({
    sourcePanelType: props.leftPanelType,
    destPanelType: props.rightPanelType,
    sourceSessionId: props.leftSessionId,
    destSessionId: props.rightSessionId,
    onRemoteTransfer: bulkRemoteTransfer
  })

  const handleLeftDrop = useCallback(async (files: FileInfo[], targetPath: string) => {
    // Remote-to-remote
    if (leftDragDrop.isRemoteToRemote) {
      return leftDragDrop.handleDrop(files, targetPath)
    }
    // Local-to-remote (upload)
    if (props.leftPanelType === 'remote' && props.rightPanelType === 'local') {
      const localPaths = files.map(f => f.path)
      await props.leftBulkOps.bulkUpload(localPaths, targetPath)
      props.leftSftp.listFiles(targetPath)
      return true
    }
    // Remote-to-local (download)
    if (props.leftPanelType === 'local' && props.rightPanelType === 'remote') {
      const remotePaths = files.map(f => f.path)
      await props.rightBulkOps.bulkDownload(remotePaths, targetPath)
      props.leftLocal.refresh()
      return true
    }
    return false
  }, [leftDragDrop, props.leftPanelType, props.rightPanelType, props.leftBulkOps, props.rightBulkOps, props.leftSftp, props.leftLocal])

  const handleRightDrop = useCallback(async (files: FileInfo[], targetPath: string) => {
    // Remote-to-remote
    if (rightDragDrop.isRemoteToRemote) {
      return rightDragDrop.handleDrop(files, targetPath)
    }
    // Local-to-remote (upload)
    if (props.rightPanelType === 'remote' && props.leftPanelType === 'local') {
      const localPaths = files.map(f => f.path)
      await props.rightBulkOps.bulkUpload(localPaths, targetPath)
      props.rightSftp.listFiles(targetPath)
      return true
    }
    // Remote-to-local (download)
    if (props.rightPanelType === 'local' && props.leftPanelType === 'remote') {
      const remotePaths = files.map(f => f.path)
      await props.leftBulkOps.bulkDownload(remotePaths, targetPath)
      props.rightLocal.refresh()
      return true
    }
    return false
  }, [rightDragDrop, props.rightPanelType, props.leftPanelType, props.rightBulkOps, props.leftBulkOps, props.rightSftp, props.rightLocal])

  const leftContextValue = useMemo(() => {
    const isRemote = props.leftPanelType === 'remote';
    const handler = isRemote ? props.leftSftp : props.leftLocal;
    
    return {
      onDelete: handler.deleteFile,
      onRename: handler.rename,
      onChmod: handler.chmod,
      onMkdir: isRemote ? handler.createDirectory : handler.mkdir,
      onNavigate: isRemote ? handler.listFiles : handler.navigate,
      onRefresh: handler.refresh,
      onDrop: handleLeftDrop,
      selectedFile: props.selectedLocal,
      onSelectFile: props.onSelectLocal,
      currentPath: props.leftCurrentPath,
      loading: props.leftLoading,
      isRemote,
      sessionId: props.leftSessionId,
      transferActive: props.transferActive,
      fetchSuggestions: handler.listPath,
      onDownloadToTemp: isRemote ? handler.downloadToTemp : undefined,
      selectedItems: props.leftSelectedItems,
      onItemSelect: props.onLeftItemSelect,
      isItemSelected: props.isLeftItemSelected,
      onTitleClick: props.onLeftTitleClick,
    };
  }, [
    props.leftPanelType,
    props.leftSftp,
    props.leftLocal,
    props.selectedLocal,
    props.onSelectLocal,
    props.leftCurrentPath,
    props.leftLoading,
    props.leftSessionId,
    props.transferActive,
    props.leftSelectedItems,
    props.onLeftItemSelect,
    props.isLeftItemSelected,
    props.onLeftTitleClick,
    handleLeftDrop
  ]);

  const rightContextValue = useMemo(() => {
    const isRemote = props.rightPanelType === 'remote';
    const handler = isRemote ? props.rightSftp : props.rightLocal;
    
    return {
      onDelete: handler.deleteFile,
      onRename: handler.rename,
      onChmod: handler.chmod,
      onMkdir: isRemote ? handler.createDirectory : handler.mkdir,
      onNavigate: isRemote ? handler.listFiles : handler.navigate,
      onRefresh: handler.refresh,
      onDrop: handleRightDrop,
      selectedFile: props.selectedRemote,
      onSelectFile: props.onSelectRemote,
      currentPath: props.rightCurrentPath,
      loading: props.rightLoading,
      isRemote,
      sessionId: props.rightSessionId,
      transferActive: props.transferActive,
      fetchSuggestions: handler.listPath,
      onDownloadToTemp: isRemote ? handler.downloadToTemp : undefined,
      selectedItems: props.rightSelectedItems,
      onItemSelect: props.onRightItemSelect,
      isItemSelected: props.isRightItemSelected,
      onTitleClick: props.onRightTitleClick,
    };
  }, [
    props.rightPanelType,
    props.rightSftp,
    props.rightLocal,
    props.selectedRemote,
    props.onSelectRemote,
    props.rightCurrentPath,
    props.rightLoading,
    props.rightSessionId,
    props.transferActive,
    props.rightSelectedItems,
    props.onRightItemSelect,
    props.isRightItemSelected,
    props.onRightTitleClick,
    handleRightDrop
  ]);

  const leftConnection = props.leftSessionId ? getSession(props.leftSessionId)?.connection : undefined
  const rightConnection = props.rightSessionId ? getSession(props.rightSessionId)?.connection : undefined
  const leftTitle = props.leftPanelType === 'local'
    ? 'Local'
    : `Remote: ${leftConnection?.name || leftConnection?.host || 'Unknown'}`
  const rightTitle = props.rightPanelType === 'local'
    ? 'Local'
    : `Remote: ${rightConnection?.name || rightConnection?.host || 'Unknown'}`

  const handleLeftDeleteConfirm = useCallback(async () => {
    const items = Array.from(props.leftSelectedItems)
    if (props.leftPanelType === 'remote') {
      await props.leftBulkOps.bulkDelete(items)
    } else {
      for (const name of items) {
        await props.leftLocal.deleteFile(`${props.leftCurrentPath}/${name}`)
      }
      props.leftLocal.refresh()
    }
    props.onLeftClearSelection()
    setShowLeftDeleteConfirm(false)
  }, [
    props.leftSelectedItems,
    props.leftPanelType,
    props.leftBulkOps,
    props.leftLocal,
    props.leftCurrentPath,
    props.onLeftClearSelection
  ])

  const handleRightDeleteConfirm = useCallback(async () => {
    const items = Array.from(props.rightSelectedItems)
    if (props.rightPanelType === 'remote') {
      await props.rightBulkOps.bulkDelete(items)
    } else {
      for (const name of items) {
        await props.rightLocal.deleteFile(`${props.rightCurrentPath}/${name}`)
      }
      props.rightLocal.refresh()
    }
    props.onRightClearSelection()
    setShowRightDeleteConfirm(false)
  }, [
    props.rightSelectedItems,
    props.rightPanelType,
    props.rightBulkOps,
    props.rightLocal,
    props.rightCurrentPath,
    props.onRightClearSelection
  ])

  return (
    <div className="flex flex-1 gap-4 overflow-hidden relative">
      <div className="flex-1 h-full overflow-hidden relative">
        {props.showingSelector === 'left' || (props.leftPanelType === 'remote' && !props.leftSessionId) ? (
          <div className="h-full border rounded-lg bg-card">
            <PanelSelector 
              onSelect={(type, connectionId) => props.onPanelSelect('left', type, connectionId)}
              onCancel={props.onSelectorClose}
              connectingConnectionId={props.connectingConnectionId}
            />
          </div>
        ) : (
          <>
            <FilePanelProvider value={leftContextValue}>
              <FilePanel title={leftTitle} files={props.leftFiles} />
            </FilePanelProvider>
            {props.leftSelectedItems.size > 1 && (
              <BulkActionBar
                selectedCount={props.leftSelectedItems.size}
                onDelete={() => setShowLeftDeleteConfirm(true)}
                onDownload={async () => {
                  const items = Array.from(props.leftSelectedItems)
                  const itemPaths = items.map(name => `${props.leftCurrentPath}/${name}`)
                  
                  // Check if both panels are remote
                  if (isRemoteToRemote(props.leftPanelType, props.rightPanelType)) {
                    if (props.leftSessionId && props.rightSessionId) {
                      await bulkRemoteTransfer(
                        props.leftSessionId,
                        props.rightSessionId,
                        itemPaths,
                        props.rightCurrentPath
                      )
                    }
                  } else if (props.leftPanelType === 'remote') {
                    await props.leftBulkOps.bulkDownload(items, props.rightCurrentPath)
                  } else {
                    await props.leftBulkOps.bulkUpload(itemPaths, props.rightCurrentPath)
                  }
                  props.onLeftClearSelection()
                }}
                onClear={props.onLeftClearSelection}
                actionLabel={
                  isRemoteToRemote(props.leftPanelType, props.rightPanelType)
                    ? 'Transfer'
                    : props.leftPanelType === 'local'
                    ? 'Upload'
                    : 'Download'
                }
              />
            )}
          </>
        )}
      </div>

      <div className="flex-1 h-full overflow-hidden relative">
        {props.showingSelector === 'right' || (props.rightPanelType === 'remote' && !props.rightSessionId) ? (
          <div className="h-full border rounded-lg bg-card">
            <PanelSelector 
              onSelect={(type, connectionId) => props.onPanelSelect('right', type, connectionId)}
              onCancel={props.onSelectorClose}
              connectingConnectionId={props.connectingConnectionId}
            />
          </div>
        ) : (
          <>
            <FilePanelProvider value={rightContextValue}>
              <FilePanel title={rightTitle} files={props.rightFiles} />
            </FilePanelProvider>
            {props.rightSelectedItems.size > 1 && (
              <BulkActionBar
                selectedCount={props.rightSelectedItems.size}
                onDelete={() => setShowRightDeleteConfirm(true)}
                onDownload={async () => {
                  const items = Array.from(props.rightSelectedItems)
                  const itemPaths = items.map(name => `${props.rightCurrentPath}/${name}`)
                  
                  // Check if both panels are remote
                  if (isRemoteToRemote(props.rightPanelType, props.leftPanelType)) {
                    if (props.rightSessionId && props.leftSessionId) {
                      await bulkRemoteTransfer(
                        props.rightSessionId,
                        props.leftSessionId,
                        itemPaths,
                        props.leftCurrentPath
                      )
                    }
                  } else if (props.rightPanelType === 'remote') {
                    await props.rightBulkOps.bulkDownload(items, props.leftCurrentPath)
                  } else {
                    await props.rightBulkOps.bulkUpload(itemPaths, props.leftCurrentPath)
                  }
                  props.onRightClearSelection()
                }}
                onClear={props.onRightClearSelection}
                actionLabel={
                  isRemoteToRemote(props.rightPanelType, props.leftPanelType)
                    ? 'Transfer'
                    : props.rightPanelType === 'local'
                    ? 'Upload'
                    : 'Download'
                }
              />
            )}
          </>
        )}
      </div>
      <ConfirmDialog
        open={showLeftDeleteConfirm}
        onOpenChange={setShowLeftDeleteConfirm}
        title="Delete multiple items"
        description={`Are you sure you want to delete ${Array.from(props.leftSelectedItems).length} item(s)? This action cannot be undone.`}
        confirmText="Delete"
        destructive
        onConfirm={handleLeftDeleteConfirm}
      />
      <ConfirmDialog
        open={showRightDeleteConfirm}
        onOpenChange={setShowRightDeleteConfirm}
        title="Delete multiple items"
        description={`Are you sure you want to delete ${Array.from(props.rightSelectedItems).length} item(s)? This action cannot be undone.`}
        confirmText="Delete"
        destructive
        onConfirm={handleRightDeleteConfirm}
      />
    </div>
  );
}
