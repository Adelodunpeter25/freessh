import { useState } from "react";
import { FilePanel } from "./FilePanel";
import { ConnectionSelector } from "./ConnectionSelector";
import { FileInfo } from "@/types";
import { useConnectionStore } from "@/stores/connectionStore";
import { useFilePreviewContext } from "@/contexts/FilePreviewContext";
import { LoadingOverlay } from "@/components/common/LoadingOverlay";

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
}: RemotePanelProps) {
  const connections = useConnectionStore((state) => state.connections);
  const [connectedConnectionId, setConnectedConnectionId] = useState<string>("");
  const { previewLoading, isRemotePreview } = useFilePreviewContext();

  const connectedConnection = connections.find(
    (c) => c.id === connectedConnectionId,
  );

  const handleConnect = (newSessionId: string, connectionId: string) => {
    setConnectedConnectionId(connectionId);
    onSessionChange(newSessionId);
  };

  if (!sessionId) {
    return <ConnectionSelector onConnect={handleConnect} />;
  }

  return (
    <div className="relative h-full">
      <LoadingOverlay visible={previewLoading && isRemotePreview} message="Loading preview..." />
      <FilePanel
        title={`Remote Server: ${connectedConnection?.name || ""}`}
        files={files}
        currentPath={currentPath}
        loading={loading}
        isRemote={true}
        onNavigate={onNavigate}
        onRefresh={onRefresh}
        onDelete={onDelete}
        onRename={onRename}
        onChmod={onChmod}
        onMkdir={onMkdir}
        onDrop={onDrop}
        selectedFile={selectedFile}
        onSelectFile={onSelectFile}
        transferActive={transferActive}
        fetchSuggestions={fetchSuggestions}
      />
    </div>
  );
}
