import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { connectionService } from "../../services/ipc";
import { backendService } from "../../services/ipc/backend";
import { ConnectionConfig, Session } from "../../types";
import { useConnectionStore } from "../../stores/connectionStore";
import { useSessionStore } from "../../stores/sessionStore";
import { useTabStore } from "../../stores/tabStore";
import { HostKeyVerification } from "@/types/knownHost";

export const useConnections = () => {
  const [loading, setLoading] = useState(false);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingVerification, setPendingVerification] = useState<HostKeyVerification | null>(null);

  const connections = useConnectionStore((state) => state.connections);
  const hasLoadedConnections = useConnectionStore((state) => state.hasLoadedConnections);
  const setStoreConnections = useConnectionStore((state) => state.setConnections);
  const ensureConnectionsLoaded = useConnectionStore((state) => state.ensureConnectionsLoaded);
  const addSession = useSessionStore((state) => state.addSession);
  const addTab = useTabStore((state) => state.addTab);

  // Listen for host key verification events
  useEffect(() => {
    const handleVerification = (message: any) => {
      const verification = message.data as HostKeyVerification;
      setPendingVerification(verification);
    };

    backendService.on('host_key:verify', handleVerification);

    return () => {
      backendService.off('host_key:verify', handleVerification);
    };
  }, []);

  const loadConnections = useCallback(async (options?: { force?: boolean }) => {
    setLoading(true);
    setError(null);

    try {
      const data = options?.force
        ? await connectionService.list()
        : await ensureConnectionsLoaded();
      setStoreConnections(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load connections";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [ensureConnectionsLoaded, setStoreConnections]);

  useEffect(() => {
    if (!hasLoadedConnections) {
      loadConnections();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasLoadedConnections]);

  const getConnection = useCallback(async (id: string) => {
    try {
      return await connectionService.get(id);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to get connection";
      setError(errorMessage);
      throw err;
    }
  }, []);

  const deleteConnection = useCallback(
    async (id: string) => {
      try {
        await connectionService.delete(id);
        await loadConnections({ force: true });
        toast.success("Connection deleted");
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete connection";
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      }
    },
    [loadConnections],
  );

  const updateConnection = useCallback(
    async (config: ConnectionConfig) => {
      try {
        await connectionService.update(config);
        await loadConnections({ force: true });
        toast.success("Connection updated");
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update connection";
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      }
    },
    [loadConnections],
  );

  const connectAndOpen = useCallback(
    async (config: ConnectionConfig): Promise<Session> => {
      setConnectingId(config.id);
      try {
        const session = await connectionService.connect(config);
        addSession(session, config);
        addTab(session, config, "terminal");
        toast.success(`Connected to ${config.name || config.host}`);
        return session;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to connect";
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      } finally {
        setConnectingId(null);
      }
    },
    [addSession, addTab],
  );

  const saveAndConnect = useCallback(
    async (config: ConnectionConfig): Promise<void> => {
      try {
        await connectAndOpen(config);
        await loadConnections({ force: true });
      } catch (err) {
        throw err;
      }
    },
    [connectAndOpen, loadConnections],
  );

  const handleVerificationTrust = useCallback(() => {
    if (pendingVerification) {
      // Send trust response to backend
      backendService.send({
        type: 'host_key:verify_response',
        data: {
          hostname: pendingVerification.hostname,
          port: pendingVerification.port,
          trusted: true
        }
      });
    }
    setPendingVerification(null);
  }, [pendingVerification]);

  const handleVerificationCancel = useCallback(() => {
    if (pendingVerification) {
      // Send reject response to backend
      backendService.send({
        type: 'host_key:verify_response',
        data: {
          hostname: pendingVerification.hostname,
          port: pendingVerification.port,
          trusted: false
        }
      });
    }
    setPendingVerification(null);
    setConnectingId(null);
  }, [pendingVerification]);

  return {
    connections,
    loading,
    connectingId,
    error,
    pendingVerification,
    loadConnections,
    getConnection,
    deleteConnection,
    updateConnection,
    connectAndOpen,
    saveAndConnect,
    handleVerificationTrust,
    handleVerificationCancel,
  };
};
