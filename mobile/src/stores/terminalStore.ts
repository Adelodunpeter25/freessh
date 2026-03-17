import { create } from "zustand";
import type { ConnectionConfig } from "@/types";
import { sshService } from "@/services";
import { keyService } from "@/services/crud";
import type { SSHClientInstance } from "@/services/ssh/sshService";

export type TerminalSession = {
  id: string;
  connectionId: string;
  name: string;
  status: "connecting" | "connected" | "error" | "closed";
  output: string;
};

type OutputListener = (data: string) => void;

const clientMap = new Map<string, SSHClientInstance>();
const outputListeners = new Map<string, Set<OutputListener>>();

type TerminalState = {
  sessions: TerminalSession[];
  activeSessionId: string | null;
  connectingByConnectionId: Record<string, boolean>;
  openSession: (connection: ConnectionConfig) => Promise<string>;
  setActiveSession: (id: string) => void;
  closeSession: (id: string) => Promise<void>;
  sendInput: (id: string, data: string) => Promise<void>;
  subscribeOutput: (id: string, listener: OutputListener) => () => void;
  clearOutput: (id: string) => void;
};

const makeId = () =>
  `sess-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const useTerminalStore = create<TerminalState>((set, get) => ({
  sessions: [],
  activeSessionId: null,
  connectingByConnectionId: {},

  openSession: async (connection) => {
    const id = makeId();
    set((state) => ({
      sessions: [
        ...state.sessions,
        {
          id,
          connectionId: connection.id,
          name: connection.name,
          status: "connecting",
          output: "",
        },
      ],
      activeSessionId: id,
      connectingByConnectionId: {
        ...state.connectingByConnectionId,
        [connection.id]: true,
      },
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

      clientMap.set(id, client);
      
      // Set up shell listener BEFORE starting shell
      sshService.onShell(client, (data) => {
        console.log('Shell output received:', JSON.stringify(data));
        // Update session output
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === id ? { ...s, output: s.output + data } : s,
          ),
        }));

        // Notify listeners
        const listeners = outputListeners.get(id);
        if (!listeners) return;
        listeners.forEach((fn) => fn(data));
      });

      await sshService.startShell(client, "xterm");
      
      // Send a newline to trigger prompt
      await sshService.writeToShell(client, "\n");

      set((state) => ({
        sessions: state.sessions.map((s) =>
          s.id === id ? { ...s, status: "connected" } : s,
        ),
        connectingByConnectionId: {
          ...state.connectingByConnectionId,
          [connection.id]: false,
        },
      }));

      return id;
    } catch (error) {
      set((state) => ({
        sessions: state.sessions.map((s) =>
          s.id === id ? { ...s, status: "error" } : s,
        ),
        connectingByConnectionId: {
          ...state.connectingByConnectionId,
          [connection.id]: false,
        },
      }));
      throw error;
    }
  },

  setActiveSession: (id) => {
    set({ activeSessionId: id });
  },

  closeSession: async (id) => {
    const client = clientMap.get(id);
    if (client) {
      try {
        sshService.closeShell(client);
        sshService.disconnect(client);
      } catch {
        // ignore
      }
      clientMap.delete(id);
    }
    outputListeners.delete(id);
    set((state) => {
      const nextSessions = state.sessions.filter((s) => s.id !== id);
      const closedIndex = state.sessions.findIndex((s) => s.id === id);
      let nextActiveSessionId = state.activeSessionId;

      if (state.activeSessionId === id) {
        if (nextSessions.length === 0) {
          nextActiveSessionId = null;
        } else {
          const fallbackIndex = Math.min(closedIndex, nextSessions.length - 1);
          nextActiveSessionId = nextSessions[fallbackIndex]?.id ?? null;
        }
      }

      return {
        sessions: nextSessions,
        activeSessionId: nextActiveSessionId,
      };
    });
  },

  sendInput: async (id, data) => {
    const client = clientMap.get(id);
    if (!client) return;
    
    // Don't echo the input here - the SSH shell should echo it
    // Just send it to the shell
    await sshService.writeToShell(client, data);
  },

  subscribeOutput: (id, listener) => {
    const setForId = outputListeners.get(id) ?? new Set();
    setForId.add(listener);
    outputListeners.set(id, setForId);

    // Send initial output
    const session = get().sessions.find((s) => s.id === id);
    if (session?.output) {
      listener(session.output);
    }

    return () => {
      const current = outputListeners.get(id);
      if (!current) return;
      current.delete(listener);
      if (current.size === 0) {
        outputListeners.delete(id);
      }
    };
  },

  clearOutput: (id) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === id ? { ...s, output: "" } : s,
      ),
    }));
  },
}));
