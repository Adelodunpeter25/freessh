import { useState, useEffect, useCallback } from "react";
import { connectionService } from "../services/ipc";
import { ConnectionConfig, Session } from "../types";
import { useConnectionStore } from "../stores/connectionStore";

export const useConnections = () => {
  const [connections, setConnections] = useState<ConnectionConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConnections = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await connectionService.list();
      setConnections(data);
      // populate global connection store so other components (e.g. RemotePanel) see the list
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
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete connection";
        setError(errorMessage);
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
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update connection";
        setError(errorMessage);
        throw err;
      }
    },
    [loadConnections],
  );

  const connect = useCallback(
    async (config: ConnectionConfig): Promise<Session> => {
      try {
        const session = await connectionService.connect(config);
        return session;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to connect";
        setError(errorMessage);
        throw err;
      }
    },
    [],
  );

  return {
    connections,
    loading,
    error,
    loadConnections,
    getConnection,
    deleteConnection,
    updateConnection,
    connect,
  };
};
