import { useState, useEffect } from "react";
import { Server } from "lucide-react";
import { FilePanel } from "./FilePanel";
import { FileInfo } from "@/types";
import { useConnectionStore } from "@/stores/connectionStore";
import { useUIStore } from "@/stores/uiStore";
import { useSSH } from "@/hooks";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

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
  onMkdir: (path: string) => void;
  onDrop?: (files: FileInfo[], targetPath: string) => void;
  selectedFile: FileInfo | null;
  onSelectFile: (file: FileInfo | null) => void;
  onOpenFile?: (file: FileInfo) => void;
  transferActive?: boolean;
  previewFile?: FileInfo | null;
  previewContent?: string | null;
  previewLoading?: boolean;
  onSaveFile?: (content: string) => void;
  onClosePreview?: () => void;
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
  onMkdir,
  onDrop,
  selectedFile,
  onSelectFile,
  onOpenFile,
  transferActive = false,
  previewFile,
  previewContent,
  previewLoading,
  onSaveFile,
  onClosePreview,
}: RemotePanelProps) {
  const connections = useConnectionStore((state) => state.connections);
  const sftpConnectionId = useUIStore((state) => state.sftpConnectionId);
  const clearSFTPConnection = useUIStore((state) => state.clearSFTPConnection);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string>("");
  const [connectedConnectionId, setConnectedConnectionId] =
    useState<string>("");
  const [connecting, setConnecting] = useState(false);
  const { connect } = useSSH();

  const connectedConnection = connections.find(
    (c) => c.id === connectedConnectionId,
  );

  useEffect(() => {
    if (sftpConnectionId && !sessionId) {
      setSelectedConnectionId(sftpConnectionId);
      clearSFTPConnection();
      const connection = connections.find((c) => c.id === sftpConnectionId);
      if (connection) {
        setConnecting(true);
        connect(connection)
          .then((session) => {
            setConnectedConnectionId(sftpConnectionId);
            onSessionChange(session.id);
          })
          .catch((error) => console.error("Failed to connect:", error))
          .finally(() => setConnecting(false));
      }
    }
  }, [
    sftpConnectionId,
    sessionId,
    connections,
    connect,
    onSessionChange,
    clearSFTPConnection,
  ]);

  const handleConnect = async () => {
    const connection = connections.find((c) => c.id === selectedConnectionId);
    if (!connection) return;

    setConnecting(true);
    try {
      const session = await connect(connection);
      setConnectedConnectionId(selectedConnectionId);
      onSessionChange(session.id);
    } catch (error) {
      console.error("Failed to connect:", error);
    } finally {
      setConnecting(false);
    }
  };

  if (!sessionId) {
    return (
      <div className="flex flex-col h-full border rounded-lg bg-card">
        <div className="p-3 border-b">
          <span className="text-sm font-medium">Remote Server</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4">
          <Server className="w-12 h-12 text-muted-foreground" />
          <p className="text-sm text-muted-foreground text-center">
            Select a connection to browse remote files
          </p>
          <div className="flex gap-2 w-full max-w-xs">
            <Select
              value={selectedConnectionId}
              onValueChange={setSelectedConnectionId}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select connection" />
              </SelectTrigger>
              <SelectContent>
                {connections.map((conn) => (
                  <SelectItem key={conn.id} value={conn.id}>
                    {conn.name || conn.host}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleConnect}
              disabled={!selectedConnectionId || connecting}
            >
              {connecting ? "Connecting..." : "Connect"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
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
      onMkdir={onMkdir}
      onDrop={onDrop}
      selectedFile={selectedFile}
      onSelectFile={onSelectFile}
      onOpenFile={onOpenFile}
      transferActive={transferActive}
      previewFile={previewFile}
      previewContent={previewContent}
      previewLoading={previewLoading}
      onSaveFile={onSaveFile}
      onClosePreview={onClosePreview}
    />
  );
}
