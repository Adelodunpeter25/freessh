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
import { useTerminalStore, useThemeStore } from "@/stores";

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

  useEffect(() => {
    if (!activeSessionId || !isMountedRef.current) return;

    // Don't clear terminal when switching sessions - just subscribe to new output
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
    // Reserved for future PTY resize support.
    void cols;
    void rows;
  }, []);

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
                  style={{ flex: 1 }}
                  theme={terminalColors}
                  showLoading={activeSession.status === "connecting"}
                  connectionName={activeSession.name}
                />
              </YStack>
            ) : null}
          </YStack>
        )}
      </TerminalScreen>
    </>
  );
}
