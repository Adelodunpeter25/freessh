import { useEffect, useMemo, useRef } from "react";
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

  const t = useTheme();
  const isDark = useThemeStore((s) => s.theme === "dark");

  const terminalColors = useMemo(
    () => ({
      background: t.background.get(),
      foreground: t.color.get(),
      cursor: t.accent.get(),
      selection: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)",
    }),
    [t, isDark],
  );

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeSessionId) ?? null,
    [sessions, activeSessionId],
  );

  useEffect(() => {
    if (!activeSessionId) return;

    // Clear terminal first for fresh session UI
    terminalRef.current?.clear();

    const unsubscribe = subscribeOutput(activeSessionId, (data) => {
      terminalRef.current?.write(data);
    });

    return () => unsubscribe();
  }, [activeSessionId, subscribeOutput]);

  const handleTerminalReady = (cols: number, rows: number) => {
    // Reserved for future PTY resize support.
    void cols;
    void rows;
  };

  return (
    <>
      <AppHeader
        title="Active Sessions"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />
      <TerminalScreen keyboardOffset={48}>
        {sessions.length === 0 ? (
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
              onClose={(id) => {
                void closeSession(id);
              }}
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
                  onInput={(data) => {
                    if (!activeSessionId) return;
                    sendInput(activeSessionId, data);
                  }}
                  onReady={handleTerminalReady}
                  style={{ flex: 1 }}
                  theme={terminalColors}
                />
              </YStack>
            ) : null}
          </YStack>
        )}
      </TerminalScreen>
    </>
  );
}
