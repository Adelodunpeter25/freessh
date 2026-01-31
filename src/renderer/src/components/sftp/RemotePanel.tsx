import { useState, useCallback, useMemo } from "react";
import { FilePanel } from "./FilePanel";
import { ConnectionSelector } from "./ConnectionSelector";
import { FileInfo } from "@/types";
import { useConnectionStore } from "@/stores/connectionStore";
import { FilePanelProvider } from "@/contexts/FilePanelContext";
import { useMultiSelect } from "@/hooks/sftp";

interface RemotePanelProps {
  sessionId: string | null;
  onSessionChange: (sessionId: string | null) => void;
  files: FileInfo[];
  currentPath: string;
  loading: boolean;
  onNavigate: (path: string) => void;
  onRefresh: () => void;
  onDelete: (path: string) => Promise<void>;
  onRename: (oldPath: string, newPath: string) => void;
  onChmod: (path: string, mode: number) => Promise<void>;
  onMkdir: (path: string) => void;
  onDrop?: (files: FileInfo[], targetPath: string) => void;
  selectedFile: FileInfo | null;
  onSelectFile: (file: FileInfo | null) => void;
  transferActive?: boolean;
  fetchSuggestions: (path: string) => Promise<FileInfo[]>;
  onDownloadToTemp?: (remotePath: string, filename: string) => Promise<string>;
  selectedItems?: Set<string>;
  onItemSelect?: (items: FileInfo[], file: FileInfo, index: number, event: React.MouseEvent) => void;
  isItemSelected?: (fileName: string) => boolean;
  onTitleClick?: () => void;
}

export function RemotePanel({
  sessionId,
  onSessionChange,
  files,
  currentPath,
  loading,
  onNavigate,
  onRefresh,
  onDelete,
  onRename,
  onChmod,
  onMkdir,
  onDrop,
  selectedFile,
  onSelectFile,
  transferActive = false,
  fetchSuggestions,
  onDownloadToTemp,
  selectedItems,
  onItemSelect,
  isItemSelected,
  onTitleClick,
}: RemotePanelProps) {
  const connections = useConnectionStore((state) => state.connections);
  const [connectedConnectionId, setConnectedConnectionId] = useState<string>("");

  const connectedConnection = connections.find(
    (c) => c.id === connectedConnectionId,
  );

  const handleConnect = useCallback((newSessionId: string, connectionId: string) => {
    setConnectedConnectionId(connectionId);
    onSessionChange(newSessionId);
  }, [onSessionChange]);

  const contextValue = useMemo(() => ({
    onDelete,
    onRename,
    onChmod,
    onMkdir,
    onNavigate,
    onRefresh,
    onDrop,
    selectedFile,
    onSelectFile,
    currentPath,
    loading,
    isRemote: true,
    sessionId,
    transferActive,
    fetchSuggestions,
    onDownloadToTemp,
    selectedItems,
    onItemSelect,
    isItemSelected,
    onTitleClick,
  }), [onDelete, onRename, onChmod, onMkdir, onNavigate, onRefresh, onDrop, selectedFile, onSelectFile, currentPath, loading, sessionId, transferActive, fetchSuggestions, onDownloadToTemp, selectedItems, onItemSelect, isItemSelected, onTitleClick]);

  if (!sessionId) {
    return <ConnectionSelector onConnect={handleConnect} />;
  }

  return (
    <FilePanelProvider value={contextValue}>
      <FilePanel
        title={`Remote Server: ${connectedConnection?.name || ""}`}
        files={files}
      />
    </FilePanelProvider>
  )
}
