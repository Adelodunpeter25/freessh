import { useCallback, useEffect, useState } from "react";
import { backendService } from "@/services/ipc/backend";
import { connectionService } from "@/services/ipc/connection";
import { sshService } from "@/services/ipc/ssh";
import { useSessionStore } from "@/stores/sessionStore";
import { useTabStore } from "@/stores/tabStore";
import { toast } from "sonner";
import type { IPCMessage, Session } from "@/types";
import type { DisconnectNotice } from "@/components/terminal/DisconnectNotifications";

export function useSessionLifecycle() {
  const [disconnectNotices, setDisconnectNotices] = useState<DisconnectNotice[]>([]);
  const [reconnectingSessionId, setReconnectingSessionId] = useState<string | null>(null);

  const removeSession = useSessionStore((state) => state.removeSession);
  const addSession = useSessionStore((state) => state.addSession);
  const updateSession = useSessionStore((state) => state.updateSession);
  const getSession = useSessionStore((state) => state.getSession);

  const getTabBySessionId = useTabStore((state) => state.getTabBySessionId);
  const removeTab = useTabStore((state) => state.removeTab);
  const updateTabSession = useTabStore((state) => state.updateTabSession);

  useEffect(() => {
    const handleSessionStatus = (message: IPCMessage) => {
      const sessionId = message.session_id;
      if (!sessionId) return;

      const status = typeof message.data?.status === "string"
        ? message.data.status
        : (message.data as Session | undefined)?.status;
      const reason = typeof message.data?.reason === "string" ? message.data.reason : "";
      const messageError = typeof message.data?.error === "string" ? message.data.error : "";

      if (!status) return;

      if (status === "disconnected" || status === "error") {
        const tab = getTabBySessionId(sessionId);
        updateSession(sessionId, {
          status: status === "error" ? "error" : "disconnected",
          error: messageError || undefined,
        });

        if (status === "error") {
          const errorMsg = messageError || (message.data as Session | undefined)?.error || "Session ended with an error";
          toast.error(errorMsg);
        } else if (reason !== "user_initiated" && tab) {
          setDisconnectNotices((prev) => {
            const existing = prev.some((item) => item.sessionId === sessionId);
            if (existing) return prev;
            return [
              ...prev,
              {
                sessionId,
                tabId: tab.id,
                title: tab.title,
                reason,
                error: messageError,
              },
            ];
          });
        }
      }
    };

    backendService.on("session_status", handleSessionStatus);
    return () => {
      backendService.off("session_status", handleSessionStatus);
    };
  }, [getTabBySessionId, updateSession]);

  const handleDismissDisconnect = useCallback((item: DisconnectNotice) => {
    setDisconnectNotices((prev) => prev.filter((notice) => notice.sessionId !== item.sessionId));
  }, []);

  const handleCloseDisconnectedTab = useCallback(async (item: DisconnectNotice) => {
    setDisconnectNotices((prev) => prev.filter((notice) => notice.sessionId !== item.sessionId));

    try {
      await sshService.disconnect(item.sessionId);
    } catch {
      // Session may already be dead. UI cleanup should still proceed.
    }

    removeSession(item.sessionId);
    removeTab(item.tabId);
  }, [removeSession, removeTab]);

  const handleReconnect = useCallback(async (item: DisconnectNotice) => {
    const sessionData = getSession(item.sessionId);
    const connection = sessionData?.connection;
    if (!connection) {
      toast.error("Connection details not available for reconnect");
      return;
    }

    setReconnectingSessionId(item.sessionId);
    try {
      const newSession = await connectionService.connect(connection);
      addSession(newSession, connection);
      updateTabSession(item.tabId, newSession.id);
      removeSession(item.sessionId);
      setDisconnectNotices((prev) => prev.filter((notice) => notice.sessionId !== item.sessionId));
      toast.success(`Reconnected to ${connection.name || connection.host}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Reconnect failed";
      toast.error(message);
    } finally {
      setReconnectingSessionId(null);
    }
  }, [addSession, getSession, removeSession, updateTabSession]);

  return {
    disconnectNotices,
    reconnectingSessionId,
    handleReconnect,
    handleCloseDisconnectedTab,
    handleDismissDisconnect,
  };
}
