import { useState, useEffect } from "react";
import { Server } from "lucide-react";
import { toast } from "sonner";
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

interface ConnectionSelectorProps {
  onConnect: (sessionId: string, connectionId: string) => void;
}

export function ConnectionSelector({ onConnect }: ConnectionSelectorProps) {
  const connections = useConnectionStore((state) => state.connections);
  const sftpConnectionId = useUIStore((state) => state.sftpConnectionId);
  const clearSFTPConnection = useUIStore((state) => state.clearSFTPConnection);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string>("");
  const [connecting, setConnecting] = useState(false);
  const { connect } = useSSH();

  useEffect(() => {
    if (sftpConnectionId) {
      setSelectedConnectionId(sftpConnectionId);
      clearSFTPConnection();
      const connection = connections.find((c) => c.id === sftpConnectionId);
      if (connection) {
        setConnecting(true);
        connect(connection)
          .then((session) => {
            onConnect(session.id, sftpConnectionId);
            toast.success(`Connected to ${connection.name || connection.host}`);
          })
          .catch((error) => {
            console.error("Failed to connect:", error);
            toast.error(error instanceof Error ? error.message : "Failed to connect");
          })
          .finally(() => setConnecting(false));
      }
    }
  }, [sftpConnectionId, connections, connect, onConnect, clearSFTPConnection]);

  const handleConnect = async () => {
    const connection = connections.find((c) => c.id === selectedConnectionId);
    if (!connection) return;

    setConnecting(true);
    try {
      const session = await connect(connection);
      onConnect(session.id, selectedConnectionId);
      toast.success(`Connected to ${connection.name || connection.host}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to connect");
    } finally {
      setConnecting(false);
    }
  };

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
