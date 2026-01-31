import { useMemo } from "react";
import { FilePanel } from "./FilePanel";
import { RemotePanel } from "./RemotePanel";
import { BulkActionBar } from "./BulkActionBar";
import { PanelSelector } from "./PanelSelector";
import { FilePanelProvider } from "@/contexts/FilePanelContext";
import { FileInfo } from "@/types";

interface SFTPPanelsProps {
  sessionId: string | null;
  onSessionChange: (sessionId: string | null) => void;
  localFiles: FileInfo[];
  remoteFiles: FileInfo[];
  localCurrentPath: string;
  remoteCurrentPath: string;
  remoteLoading: boolean;
  localLoading: boolean;
  selectedLocal: FileInfo | null;
  selectedRemote: FileInfo | null;
  onSelectLocal: (file: FileInfo | null) => void;
  onSelectRemote: (file: FileInfo | null) => void;
  transferActive: boolean;
  onLocalDelete: (path: string) => Promise<void>;
  onLocalRename: (oldPath: string, newPath: string) => Promise<void>;
  onLocalChmod: (path: string, mode: number) => Promise<void>;
  onLocalMkdir: (path: string) => Promise<void>;
  onLocalNavigate: (path: string) => void;
  onLocalRefresh: () => void;
  onLocalDrop: (files: FileInfo[], targetPath: string) => Promise<void>;
  onLocalFetchSuggestions: (path: string) => Promise<FileInfo[]>;
  onRemoteNavigate: (path: string) => Promise<void>;
  onRemoteRefresh: () => void;
  onRemoteDelete: (path: string) => Promise<void>;
  onRemoteRename: (oldPath: string, newPath: string) => Promise<void>;
  onRemoteChmod: (path: string, mode: number) => Promise<void>;
  onRemoteMkdir: (path: string) => Promise<void>;
  onRemoteDrop: (files: FileInfo[], targetPath: string) => Promise<void>;
  onRemoteDownloadToTemp: (remotePath: string, filename: string) => Promise<string>;
  onRemoteFetchSuggestions: (path: string) => Promise<FileInfo[]>;
  localSelectedItems: Set<string>;
  remoteSelectedItems: Set<string>;
  onLocalItemSelect: (fileName: string, isMulti: boolean) => void;
  onRemoteItemSelect: (fileName: string, isMulti: boolean) => void;
  isLocalItemSelected: (fileName: string) => boolean;
  isRemoteItemSelected: (fileName: string) => boolean;
  onLocalBulkDelete: () => void;
  onLocalBulkUpload: () => Promise<void>;
  onLocalClearSelection: () => void;
  onRemoteBulkDelete: () => void;
  onRemoteBulkDownload: () => Promise<void>;
  onRemoteClearSelection: () => void;
  onLocalTitleClick?: () => void;
  onRemoteTitleClick?: () => void;
  showingSelector?: 'left' | 'right' | null;
  onSelectorClose?: () => void;
  onPanelSelect?: (panel: 'left' | 'right', type: 'local' | 'remote', connectionId?: string) => void;
  leftPanelType?: 'local' | 'remote';
  leftSessionId?: string | null;
  rightPanelType?: 'local' | 'remote';
  rightSessionId?: string | null;
}

export function SFTPPanels(props: SFTPPanelsProps) {
  const localContextValue = useMemo(() => ({
    onDelete: props.onLocalDelete,
    onRename: props.onLocalRename,
    onChmod: props.onLocalChmod,
    onMkdir: props.onLocalMkdir,
    onNavigate: props.onLocalNavigate,
    onRefresh: props.onLocalRefresh,
    onDrop: props.onLocalDrop,
    selectedFile: props.selectedLocal,
    onSelectFile: props.onSelectLocal,
    currentPath: props.localCurrentPath,
    loading: props.localLoading,
    isRemote: false,
    transferActive: props.transferActive,
    fetchSuggestions: props.onLocalFetchSuggestions,
    selectedItems: props.localSelectedItems,
    onItemSelect: props.onLocalItemSelect,
    isItemSelected: props.isLocalItemSelected,
    onTitleClick: props.onLocalTitleClick,
  }), [
    props.onLocalDelete,
    props.onLocalRename,
    props.onLocalChmod,
    props.onLocalMkdir,
    props.onLocalNavigate,
    props.onLocalRefresh,
    props.onLocalDrop,
    props.selectedLocal,
    props.onSelectLocal,
    props.localCurrentPath,
    props.localLoading,
    props.transferActive,
    props.onLocalFetchSuggestions,
    props.localSelectedItems,
    props.onLocalItemSelect,
    props.isLocalItemSelected,
    props.onLocalTitleClick,
  ]);

  return (
    <div className="flex flex-1 gap-4 overflow-hidden relative">
      <div className="flex-1 h-full overflow-hidden relative">
        {props.showingSelector === 'left' ? (
          <div className="h-full border rounded-lg bg-card">
            <PanelSelector 
              onSelect={(type, connectionId) => {
                props.onPanelSelect?.('left', type, connectionId)
              }}
              onCancel={() => props.onSelectorClose?.()}
            />
          </div>
        ) : props.leftPanelType === 'remote' && props.leftSessionId ? (
          <>
            <RemotePanel
              sessionId={props.leftSessionId}
              onSessionChange={(sid) => console.log('Left remote session change:', sid)}
              files={props.remoteFiles}
              currentPath={props.remoteCurrentPath}
              loading={props.remoteLoading}
              onNavigate={props.onRemoteNavigate}
              onRefresh={props.onRemoteRefresh}
              onDelete={props.onRemoteDelete}
              onRename={props.onRemoteRename}
              onChmod={props.onRemoteChmod}
              onMkdir={props.onRemoteMkdir}
              onDrop={props.onRemoteDrop}
              onDownloadToTemp={props.onRemoteDownloadToTemp}
              selectedFile={props.selectedRemote}
              onSelectFile={props.onSelectRemote}
              transferActive={props.transferActive}
              fetchSuggestions={props.onRemoteFetchSuggestions}
              selectedItems={props.remoteSelectedItems}
              onItemSelect={props.onRemoteItemSelect}
              isItemSelected={props.isRemoteItemSelected}
              onTitleClick={() => props.onLocalTitleClick?.()}
            />
          </>
        ) : (
          <>
            <FilePanelProvider value={localContextValue}>
              <FilePanel title="Local" files={props.localFiles} />
            </FilePanelProvider>
            {props.localSelectedItems.size > 1 && (
              <BulkActionBar
                selectedCount={props.localSelectedItems.size}
                onDelete={props.onLocalBulkDelete}
                onDownload={props.onLocalBulkUpload}
                onClear={props.onLocalClearSelection}
                actionLabel="Upload"
              />
            )}
          </>
        )}
      </div>
      <div className="flex-1 h-full overflow-hidden relative">
        {props.showingSelector === 'right' ? (
          <div className="h-full border rounded-lg bg-card">
            <PanelSelector 
              onSelect={(type, connectionId) => {
                props.onPanelSelect?.('right', type, connectionId)
              }}
              onCancel={() => props.onSelectorClose?.()}
            />
          </div>
        ) : props.rightPanelType === 'local' ? (
          <>
            <FilePanelProvider value={localContextValue}>
              <FilePanel title="Local" files={props.localFiles} />
            </FilePanelProvider>
            {props.localSelectedItems.size > 1 && (
              <BulkActionBar
                selectedCount={props.localSelectedItems.size}
                onDelete={props.onLocalBulkDelete}
                onDownload={props.onLocalBulkUpload}
                onClear={props.onLocalClearSelection}
                actionLabel="Upload"
              />
            )}
          </>
        ) : (
          <>
            <RemotePanel
              sessionId={props.sessionId}
              onSessionChange={props.onSessionChange}
              files={props.remoteFiles}
              currentPath={props.remoteCurrentPath}
              loading={props.remoteLoading}
              onNavigate={props.onRemoteNavigate}
              onRefresh={props.onRemoteRefresh}
              onDelete={props.onRemoteDelete}
              onRename={props.onRemoteRename}
              onChmod={props.onRemoteChmod}
              onMkdir={props.onRemoteMkdir}
              onDrop={props.onRemoteDrop}
              onDownloadToTemp={props.onRemoteDownloadToTemp}
              selectedFile={props.selectedRemote}
              onSelectFile={props.onSelectRemote}
              transferActive={props.transferActive}
              fetchSuggestions={props.onRemoteFetchSuggestions}
              selectedItems={props.remoteSelectedItems}
              onItemSelect={props.onRemoteItemSelect}
              isItemSelected={props.isRemoteItemSelected}
              onTitleClick={props.onRemoteTitleClick}
            />
            {props.remoteSelectedItems.size > 1 && (
              <BulkActionBar
                selectedCount={props.remoteSelectedItems.size}
                onDelete={props.onRemoteBulkDelete}
                onDownload={props.onRemoteBulkDownload}
                onClear={props.onRemoteClearSelection}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
