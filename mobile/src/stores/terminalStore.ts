import { create } from "zustand";
import type { ConnectionConfig } from "@/types";
import { sshWebSocketService } from "@/services/ssh";

export type TerminalSession = {
  id: string;
  connectionId: string;
  name: string;
  status: "connecting" | "connected" | "error" | "closed";
  output: string;
};

type OutputListener = (data: string) => void;

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

    try {
      // Connect to WebSocket server if not already connected
      await sshWebSocketService.connect();

      // Set up listeners for this session
      const unsubscribeConnected = sshWebSocketService.on('connected', (response) => {
        if (response.sessionId === id) {
          set((state) => ({
            sessions: state.sessions.map((s) =>
              s.id === id ? { ...s, status: "connected" } : s
            ),
            connectingByConnectionId: {
              ...state.connectingByConnectionId,
              [connection.id]: false,
            },
          }));
        }
      });

      const unsubscribeData = sshWebSocketService.on('data', (response) => {
        if (response.sessionId === id && response.data) {
          // Update session output
          set((state) => ({
            sessions: state.sessions.map((s) =>
              s.id === id ? { ...s, output: s.output + response.data } : s
            ),
          }));

          // Notify listeners
          const listeners = outputListeners.get(id);
          if (listeners) {
            listeners.forEach((fn) => fn(response.data));
          }
        }
      });

      const unsubscribeError = sshWebSocketService.on('error', (response) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === id ? { ...s, status: "error" } : s
          ),
          connectingByConnectionId: {
            ...state.connectingByConnectionId,
            [connection.id]: false,
          },
        }));
      });

      // Create SSH session with our session ID and initial terminal size
      sshWebSocketService.createSSHSession(connection, 59, 55, id);

      return id;
    } catch (error) {
      set((state) => ({
        sessions: state.sessions.map((s) =>
          s.id === id ? { ...s, status: "error" } : s
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
    sshWebSocketService.disconnectSession(id);
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
    sshWebSocketService.sendInput(id, data);
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
      setForId.delete(listener);
      if (setForId.size === 0) {
        outputListeners.delete(id);
      }
    };
  },

  clearOutput: (id) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === id ? { ...s, output: "" } : s
      ),
    }));
  },
}));
