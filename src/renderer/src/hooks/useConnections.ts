import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { connectionService } from "../services/ipc";
import { ConnectionConfig, Session } from "../types";
import { useConnectionStore } from "../stores/connectionStore";
import { useSessionStore } from "../stores/sessionStore";
import { useTabStore } from "../stores/tabStore";

export const useConnections = () => {
  const [connections, setConnections] = useState<ConnectionConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addSession = useSessionStore((state) => state.addSession);
  const addTab = useTabStore((state) => state.addTab);

  const loadConnections = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await connectionService.list();
      setConnections(data);
      useConnectionStore.getState().setConnections(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load connections";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

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
        await loadConnections();
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
        await loadConnections();
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
        await loadConnections();
      } catch (err) {
        throw err;
      }
    },
    [connectAndOpen, loadConnections],
  );

  return {
    connections,
    loading,
    connectingId,
    error,
    loadConnections,
    getConnection,
    deleteConnection,
    updateConnection,
    connectAndOpen,
    saveAndConnect,
  };
};
