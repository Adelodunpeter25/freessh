import { useEffect, useMemo, useRef, useCallback } from "react";
import { YStack, useTheme } from "tamagui";
import { useNavigation } from "@react-navigation/native";

import {
  EmptyState,
  AppHeader,
  SessionTabs,
  Terminal,
  TerminalScreen,
} from "@/components";
import type { TerminalHandle } from "@/components";
import { sshWebSocketService } from "@/services";
import { useTerminalStore, useThemeStore } from "@/stores";
import { addKeyCommandListener } from "@/modules/hardware-keyboard";

export function SessionsScreen() {
  const navigation = useNavigation();
  const sessions = useTerminalStore((s) => s.sessions);
  const activeSessionId = useTerminalStore((s) => s.activeSessionId);
  const setActiveSession = useTerminalStore((s) => s.setActiveSession);
  const closeSession = useTerminalStore((s) => s.closeSession);
  const sendInput = useTerminalStore((s) => s.sendInput);
  const subscribeOutput = useTerminalStore((s) => s.subscribeOutput);
  const terminalRef = useRef<TerminalHandle>(null);
  const isMountedRef = useRef(true);

  const t = useTheme();
  const isDark = useThemeStore((s) => s.theme === "dark");

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeSessionId) ?? null,
    [sessions, activeSessionId],
  );

  const terminalColors = useMemo(() => {
    if (!activeSession) return undefined;
    return {
      background: t.background?.get() ?? "#0b0b0b",
      foreground: t.color?.get() ?? "#e5e7eb",
      cursor: t.accent?.get() ?? "#f97316",
      selection: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)",
    };
  }, [activeSession, t, isDark]);

  const handleCloseSession = useCallback(async (id: string) => {
    try {
      await closeSession(id);
    } catch (error) {
      console.error("Failed to close session:", error);
    }
  }, [closeSession]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Hardware keyboard listener
  useEffect(() => {
    if (!activeSessionId) return;

    const subscription = addKeyCommandListener((event) => {
      if (!activeSessionId || !isMountedRef.current) return;

      // Handle Shift+Tab
      if (event.shift && event.input === "\t") {
        sendInput(activeSessionId, "\x1b[Z");
        return;
      }

      // Handle Ctrl key combinations
      if (event.ctrl) {
        const ch = event.input.toLowerCase();
        const code = ch.charCodeAt(0) & 0x1f;
        sendInput(activeSessionId, String.fromCharCode(code));
        return;
      }

      // Handle special keys (arrows, escape)
      const specialMap: Record<string, string> = {
        ArrowUp: "\x1b[A",
        ArrowDown: "\x1b[B",
        ArrowRight: "\x1b[C",
        ArrowLeft: "\x1b[D",
        Escape: "\x1b",
      };
      if (specialMap[event.input]) {
        sendInput(activeSessionId, specialMap[event.input]);
        return;
      }
    });

    return () => {
      subscription?.remove();
    };
  }, [activeSessionId, sendInput]);

  useEffect(() => {
    if (!activeSessionId || !isMountedRef.current) return;

    // Clear terminal when switching sessions
    if (terminalRef.current) {
      terminalRef.current.clear();
    }

    const unsubscribe = subscribeOutput(activeSessionId, (data: string) => {
      if (isMountedRef.current && terminalRef.current) {
        terminalRef.current.write(data);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [activeSessionId, subscribeOutput]);

  const handleTerminalReady = useCallback((cols: number, rows: number) => {
    if (activeSessionId && sshWebSocketService) {
      try {
        sshWebSocketService.resizeTerminal(activeSessionId, cols, rows);
      } catch (error) {
        console.error('Error resizing terminal:', error);
      }
    }
  }, [activeSessionId]);

  const handleTerminalResize = useCallback((cols: number, rows: number) => {
    if (activeSessionId && sshWebSocketService) {
      try {
        sshWebSocketService.resizeTerminal(activeSessionId, cols, rows);
      } catch (error) {
        console.error('Error resizing terminal:', error);
      }
    }
  }, [activeSessionId]);

  const hasSessions = sessions.length > 0;

  return (
    <>
      <AppHeader
        title="Active Sessions"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />
      <TerminalScreen keyboardOffset={48}>
        {!hasSessions ? (
          <YStack gap="$3" p="$4">
            <EmptyState
              title="No active sessions"
              description="Connect to a host from the connections screen."
            />
          </YStack>
        ) : (
          <YStack flex={1} gap="$0">
            <SessionTabs
              sessions={sessions}
              activeSessionId={activeSessionId}
              isDark={isDark}
              onSelect={setActiveSession}
              onClose={handleCloseSession}
            />

            {activeSession ? (
              activeSession.status === "error" ? (
                <YStack flex={1} justifyContent="center" alignItems="center" p="$4">
                  <EmptyState
                    title="Connection Failed"
                    description={`Failed to connect to ${activeSession.name}. Check your connection details.`}
                  />
                </YStack>
              ) : (
                <YStack
                  flex={1}
                  mx="$0"
                  mb="$0"
                  borderRadius={0}
                  overflow="hidden"
                  backgroundColor="$background"
                >
                  <Terminal
                    ref={terminalRef}
                    onInput={(data: string) => {
                      if (!activeSessionId || !isMountedRef.current) return;
                      sendInput(activeSessionId, data);
                    }}
                    onReady={handleTerminalReady}
                    onResize={handleTerminalResize}
                    style={{ flex: 1 }}
                    theme={terminalColors}
                    showLoading={activeSession.status === "connecting"}
                    connectionName={activeSession.name}
                  />
                </YStack>
              )
            ) : null}
          </YStack>
        )}
      </TerminalScreen>
    </>
  );
}
