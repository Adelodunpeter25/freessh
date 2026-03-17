import { useEffect, useMemo, useRef } from "react";
import { useColorScheme } from "react-native";
import { Pressable } from "react-native";
import { ScrollView, Text, XStack, YStack, useTheme } from "tamagui";
import { useNavigation } from "@react-navigation/native";

import { EmptyState, AppHeader, Terminal, TerminalScreen } from "@/components";
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
    // If we had a way to send pty resize, we'd do it here.
    // For now, we just ensure it fits nicely in the container.
    terminalRef.current?.fit();

    // Attempt to normalize the terminal on the server
    if (activeSessionId) {
      sendInput(activeSessionId, `stty cols ${cols} rows ${rows}\n`);
    }
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
          <YStack flex={1} gap="$2">
            {/* Session Tabs */}
            <YStack px="$4" pt="$2" pb="$2">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <XStack gap="$2">
                  {sessions.map((session) => {
                    const isActive = session.id === activeSessionId;
                    return (
                      <Pressable
                        key={session.id}
                        onPress={() => setActiveSession(session.id)}
                        onLongPress={() => closeSession(session.id)}
                      >
                        <XStack
                          paddingHorizontal="$3"
                          paddingVertical="$2"
                          borderRadius="$3"
                          backgroundColor={
                            isActive ? "$accent" : "$backgroundStrong"
                          }
                          borderWidth={1}
                          borderColor={isActive ? "$accent" : "$borderColor"}
                        >
                          <Text
                            color={isActive ? "$accentText" : "$color"}
                            fontSize={12}
                            fontWeight="600"
                          >
                            {session.name}
                          </Text>
                        </XStack>
                      </Pressable>
                    );
                  })}
                </XStack>
              </ScrollView>
            </YStack>

            {/* Terminal Window */}
            {activeSession ? (
              <YStack
                flex={1}
                mx="$4"
                mb="$4"
                borderRadius="$4"
                overflow="hidden"
                backgroundColor="$background"
                borderWidth={1}
                borderColor="$borderColor"
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
