import { useMemo } from "react";
import { FilePanel } from "./FilePanel";
import { BulkActionBar } from "./BulkActionBar";
import { PanelSelector } from "./PanelSelector";
import { FilePanelProvider } from "@/contexts/FilePanelContext";
import { FileInfo } from "@/types";
import { isRemoteToRemote } from "@/utils/remoteTransferDetector";
import { useRemoteTransfer } from "@/hooks";

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
  const { bulkRemoteTransfer } = useRemoteTransfer(() => {
    // Refresh both panels after remote transfer
    if (props.leftPanelType === 'remote') {
      props.leftSftp.listFiles(props.leftCurrentPath)
    }
    if (props.rightPanelType === 'remote') {
      props.rightSftp.listFiles(props.rightCurrentPath)
    }
  })

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
      onDrop: undefined,
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
      onDrop: undefined,
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
  ]);

  const leftTitle = props.leftPanelType === 'local' ? 'Local' : 'Remote';
  const rightTitle = props.rightPanelType === 'local' ? 'Local' : 'Remote';

  return (
    <div className="flex flex-1 gap-4 overflow-hidden relative">
      <div className="flex-1 h-full overflow-hidden relative">
        {props.showingSelector === 'left' ? (
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
                onDelete={() => {
                  const items = Array.from(props.leftSelectedItems)
                  if (props.leftPanelType === 'remote') {
                    props.leftBulkOps.bulkDelete(items)
                  } else {
                    items.forEach(name => props.leftLocal.deleteFile(`${props.leftCurrentPath}/${name}`))
                    props.leftLocal.refresh()
                    props.onLeftClearSelection()
                  }
                }}
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
        {props.showingSelector === 'right' ? (
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
                onDelete={() => {
                  const items = Array.from(props.rightSelectedItems)
                  if (props.rightPanelType === 'remote') {
                    props.rightBulkOps.bulkDelete(items)
                  } else {
                    items.forEach(name => props.rightLocal.deleteFile(`${props.rightCurrentPath}/${name}`))
                    props.rightLocal.refresh()
                    props.onRightClearSelection()
                  }
                }}
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
    </div>
  );
}
