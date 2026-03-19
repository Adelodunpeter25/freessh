import { useEffect, useMemo, useRef, useCallback } from "react";
import { YStack, useTheme } from "tamagui";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  EmptyState,
  SessionTabs,
  Terminal,
  TerminalScreen,
  mapHardwareKeyboardInput,
  normalizeTerminalInput,
} from "@/components";
import type { TerminalHandle } from "@/components";
import { sshWebSocketService } from "@/services";
import { useTerminalStore } from "@/stores";
import { addKeyCommandListener } from "../../../modules/hardware-keyboard/index";

export function SessionsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const sessions = useTerminalStore((s) => s.sessions);
  const activeSessionId = useTerminalStore((s) => s.activeSessionId);
  const setActiveSession = useTerminalStore((s) => s.setActiveSession);
  const closeSession = useTerminalStore((s) => s.closeSession);
  const sendInput = useTerminalStore((s) => s.sendInput);
  const subscribeOutput = useTerminalStore((s) => s.subscribeOutput);
  const terminalRef = useRef<TerminalHandle>(null);
  const isMountedRef = useRef(true);

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeSessionId) ?? null,
    [sessions, activeSessionId],
  );

  const t = useTheme();
  const terminalColors = useMemo(
    () => ({
      background: t.background?.get(),
      foreground: t.color?.get(),
      cursor: t.accent?.get(),
      selection: t.selection?.get(),
    }),
    [t],
  );

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
      const mapped = mapHardwareKeyboardInput(event);
      if (!mapped) return;
      sendInput(activeSessionId, mapped);
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
      terminalRef.current.focus();
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
    <TerminalScreen keyboardOffset={0}>
      <YStack flex={1} gap="$0" pt={Math.max(insets.top, 16)}>
        <SessionTabs
          sessions={sessions}
          activeSessionId={activeSessionId}
          isDark={true}
          onBackPress={() => navigation.goBack()}
          onSelect={setActiveSession}
          onClose={handleCloseSession}
        />
        {!hasSessions ? (
          <YStack gap="$3" p="$4">
            <EmptyState
              title="No active sessions"
              description="Connect to a host from the connections screen."
            />
          </YStack>
        ) : (
          activeSession ? (
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
                    sendInput(activeSessionId, normalizeTerminalInput(data));
                  }}
                  onReady={handleTerminalReady}
                  onResize={handleTerminalResize}
                  style={{ flex: 1 }}
                  theme={terminalColors}
                  profile={activeSession.profile}
                  showLoading={activeSession.status === "connecting"}
                  connectionName={activeSession.name}
                />
              </YStack>
            )
          ) : null
        )}
      </YStack>
    </TerminalScreen>
  );
}
