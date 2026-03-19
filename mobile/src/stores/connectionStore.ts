import { create } from "zustand";
import type { ConnectionConfig } from "@/types";
import { connectionService, keyService } from "../services/crud";
import { sshService } from "@/services";
import { sftpService } from "@/services/sftp";

type ConnectionState = {
  connections: ConnectionConfig[];
  loading: boolean;
  connectingIds: Record<string, boolean>;
  initialize: () => Promise<void>;
  addConnection: (connection: ConnectionConfig) => Promise<void>;
  duplicateConnection: (
    connection: ConnectionConfig,
  ) => Promise<ConnectionConfig>;
  updateConnection: (connection: ConnectionConfig) => Promise<void>;
  removeConnection: (id: string) => Promise<void>;
  connect: (connection: ConnectionConfig) => Promise<void>;
  connectSftp: (connection: ConnectionConfig) => Promise<void>;
};

export const useConnectionStore = create<ConnectionState>((set, get) => ({
  connections: [],
  loading: false,
  connectingIds: {},

  initialize: async () => {
    set({ loading: true });
    try {
      const connections = await connectionService.getAll();
      set({ connections, loading: false });
    } catch (error) {
      console.error("Failed to load connections:", error);
      set({ loading: false });
    }
  },

  addConnection: async (connection) => {
    await connectionService.create(connection);
    set((state) => ({ connections: [...state.connections, connection] }));
  },

  duplicateConnection: async (connection) => {
    const copy = await connectionService.duplicate(connection);
    set((state) => ({ connections: [...state.connections, copy] }));
    return copy;
  },

  updateConnection: async (connection) => {
    await connectionService.update(connection);
    set((state) => ({
      connections: state.connections.map((item) =>
        item.id === connection.id ? connection : item,
      ),
    }));
  },

  removeConnection: async (id) => {
    await connectionService.delete(id);
    set((state) => ({
      connections: state.connections.filter((item) => item.id !== id),
    }));
  },

  connect: async (connection) => {
    set((state) => ({
      connectingIds: { ...state.connectingIds, [connection.id]: true },
    }));
    const port = connection.port ?? 22;
    let client;
    try {
      if (connection.auth_method === "password") {
        if (!connection.password) {
          throw new Error("Missing password");
        }
        client = await sshService.connectWithPassword(
          connection.host,
          port,
          connection.username,
          connection.password,
        );
      } else {
        let privateKey = connection.private_key;
        let passphrase = connection.passphrase;
        if (!privateKey && connection.key_id) {
          const key = await keyService.getById(connection.key_id);
          privateKey = key?.private_key || "";
          if (!passphrase) {
            passphrase = key?.passphrase;
          }
        }
        if (!privateKey) {
          throw new Error("Missing private key");
        }
        client = await sshService.connectWithKey(
          connection.host,
          port,
          connection.username,
          privateKey,
          passphrase,
        );
      }

      sshService.disconnect(client);
    } catch (error) {
      throw error;
    } finally {
      set((state) => {
        const next = { ...state.connectingIds };
        delete next[connection.id];
        return { connectingIds: next };
      });
    }
  },

  connectSftp: async (connection) => {
    set((state) => ({
      connectingIds: { ...state.connectingIds, [connection.id]: true },
    }));
    const port = connection.port ?? 22;
    let client;
    try {
      if (connection.auth_method === "password") {
        if (!connection.password) {
          throw new Error("Missing password");
        }
        client = await sshService.connectWithPassword(
          connection.host,
          port,
          connection.username,
          connection.password,
        );
      } else {
        let privateKey = connection.private_key;
        let passphrase = connection.passphrase;
        if (!privateKey && connection.key_id) {
          const key = await keyService.getById(connection.key_id);
          privateKey = key?.private_key || "";
          if (!passphrase) {
            passphrase = key?.passphrase;
          }
        }
        if (!privateKey) {
          throw new Error("Missing private key");
        }
        client = await sshService.connectWithKey(
          connection.host,
          port,
          connection.username,
          privateKey,
          passphrase,
        );
      }

      await sftpService.connect(client);
      sshService.disconnect(client);
    } catch (error) {
      throw error;
    } finally {
      set((state) => {
        const next = { ...state.connectingIds };
        delete next[connection.id];
        return { connectingIds: next };
      });
    }
  },
}));
