import { useEffect, useMemo, useRef } from "react";
import { Pressable } from "react-native";
import { ScrollView, Text, XStack, YStack, useTheme } from "tamagui";
import { useNavigation } from "@react-navigation/native";
import { EllipsisVertical, Monitor, Plus, X } from "lucide-react-native";

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
            <YStack
              px="$3"
              py="$2"
              backgroundColor={isDark ? "#18181b" : "#e5e7eb"}
              borderBottomWidth={1}
              borderColor={isDark ? "#27272a" : "#cbd5e1"}
            >
              <XStack alignItems="center" gap="$2">
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <XStack gap="$2" alignItems="center" pr="$2">
                    {sessions.map((session) => {
                      const isActive = session.id === activeSessionId;
                      return (
                        <Pressable
                          key={session.id}
                          onPress={() => setActiveSession(session.id)}
                          onLongPress={() => closeSession(session.id)}
                        >
                          <XStack
                            minWidth={156}
                            maxWidth={220}
                            paddingLeft="$3"
                            paddingRight="$2"
                            paddingVertical="$2"
                            borderRadius={10}
                            alignItems="center"
                            gap="$2"
                            backgroundColor={isActive ? "#3f3f46" : "#27272a"}
                            borderWidth={1}
                            borderColor={isActive ? "#52525b" : "#3f3f46"}
                          >
                            <Monitor
                              size={14}
                              color={isActive ? "#fafafa" : "#d4d4d8"}
                            />
                            <Text
                              flex={1}
                              numberOfLines={1}
                              color={isActive ? "#fafafa" : "#d4d4d8"}
                              fontSize={12}
                              fontWeight="600"
                            >
                              {session.name}
                            </Text>
                            {isActive ? (
                              <EllipsisVertical size={14} color="#d4d4d8" />
                            ) : (
                              <Pressable
                                hitSlop={8}
                                onPress={(event) => {
                                  event.stopPropagation();
                                  void closeSession(session.id);
                                }}
                              >
                                <X size={14} color="#a1a1aa" />
                              </Pressable>
                            )}
                          </XStack>
                        </Pressable>
                      );
                    })}
                  </XStack>
                </ScrollView>

                <XStack
                  width={32}
                  height={32}
                  borderRadius={8}
                  alignItems="center"
                  justifyContent="center"
                  backgroundColor={isDark ? "#27272a" : "#d4d4d8"}
                >
                  <Plus size={16} color={isDark ? "#fafafa" : "#18181b"} />
                </XStack>
              </XStack>
            </YStack>

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
