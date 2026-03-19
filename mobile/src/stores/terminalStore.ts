import { create } from "zustand";
import type { ConnectionConfig } from "@/types";
import { sshWebSocketService } from "@/services/ssh";

export type TerminalSession = {
  id: string;
  connectionId: string;
  name: string;
  profile?: ConnectionConfig["profile"];
  status: "connecting" | "connected" | "error" | "closed";
};

type OutputListener = (data: string) => void;

const outputListeners = new Map<string, Set<OutputListener>>();
const CONNECT_TIMEOUT_MS = 20_000;

type TerminalState = {
  sessions: TerminalSession[];
  activeSessionId: string | null;
  connectingByConnectionId: Record<string, boolean>;
  sessionCleanup: Map<string, () => void>;
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
  sessionCleanup: new Map(),

  openSession: async (connection) => {
    const id = makeId();
    set((state) => ({
      sessions: [
        ...state.sessions,
        {
          id,
          connectionId: connection.id,
          name: connection.name,
          profile: connection.profile,
          status: "connecting",
        },
      ],
      activeSessionId: id,
      connectingByConnectionId: {
        ...state.connectingByConnectionId,
        [connection.id]: true,
      },
    }));

    try {
      await sshWebSocketService.connect();

      // Set up listeners and store cleanup functions
      return await new Promise<string>((resolve, reject) => {
        let settled = false
        let timeoutId: ReturnType<typeof setTimeout> | null = null

        const finalize = (fn: () => void) => {
          if (settled) return
          settled = true
          if (timeoutId) {
            clearTimeout(timeoutId)
            timeoutId = null
          }
          fn()
        }

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

            finalize(() => {
              resolve(id)
            })
          }
        });

        const unsubscribeData = sshWebSocketService.on('data', (response) => {
          if (response.sessionId === id && response.data) {
            const listeners = outputListeners.get(id);
            if (listeners) {
              listeners.forEach((fn) => fn(response.data));
            }
          }
        });

        const unsubscribeError = sshWebSocketService.on('error', (response) => {
          if (response.sessionId === id || !response.sessionId) {
            set((state) => ({
              sessions: state.sessions.map((s) =>
                s.id === id ? { ...s, status: "error" } : s
              ),
              connectingByConnectionId: {
                ...state.connectingByConnectionId,
                [connection.id]: false,
              },
            }));
            setTimeout(() => {
              get().closeSession(id);
            }, 3000);

            finalize(() => {
              const message =
                typeof response.error === 'string' && response.error.trim().length > 0
                  ? response.error
                  : 'Failed to establish SSH session'
              reject(new Error(message))
            })
          }
        });

        // Store cleanup function
        const cleanup = () => {
          unsubscribeConnected();
          unsubscribeData();
          unsubscribeError();
        };
        
        set((state) => {
          const newCleanup = new Map(state.sessionCleanup);
          newCleanup.set(id, cleanup);
          return { sessionCleanup: newCleanup };
        });

        timeoutId = setTimeout(() => {
          set((state) => ({
            sessions: state.sessions.map((s) =>
              s.id === id ? { ...s, status: "error" } : s
            ),
            connectingByConnectionId: {
              ...state.connectingByConnectionId,
              [connection.id]: false,
            },
          }));
          setTimeout(() => {
            get().closeSession(id);
          }, 3000);

          finalize(() => {
            reject(new Error('Connection timed out'))
          })
        }, CONNECT_TIMEOUT_MS)

        sshWebSocketService.createSSHSession(connection, 59, 55, id);
      })
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
    // Clean up WebSocket listeners
    const state = get();
    const cleanup = state.sessionCleanup.get(id);
    if (cleanup) {
      cleanup();
    }

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

      // Remove cleanup function
      const newCleanup = new Map(state.sessionCleanup);
      newCleanup.delete(id);

      return {
        sessions: nextSessions,
        activeSessionId: nextActiveSessionId,
        sessionCleanup: newCleanup,
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

    // Return unsubscribe function
    return () => {
      setForId.delete(listener);
      if (setForId.size === 0) {
        outputListeners.delete(id);
      }
    };
  },

  clearOutput: (id) => {
    // Output is no longer stored in state, this is now a no-op
    // Terminal handles its own display state
  },
}));
