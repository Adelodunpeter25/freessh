import { Pressable } from "react-native";
import { ArrowLeft, Monitor, Plus, X } from "lucide-react-native";
import { ScrollView, Text, XStack, YStack } from "tamagui";

import type { TerminalSession } from "@/stores";

type SessionTabsProps = {
  sessions: TerminalSession[];
  activeSessionId: string | null;
  isDark: boolean;
  onBackPress: () => void;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
};

export function SessionTabs({
  sessions,
  activeSessionId,
  isDark,
  onBackPress,
  onSelect,
  onClose,
}: SessionTabsProps) {
  return (
    <YStack
      px="$2.5"
      pt="$1.5"
      pb="$1.5"
      backgroundColor={isDark ? "#101114" : "#eef2f7"}
      borderBottomWidth={1}
      borderColor={isDark ? "#24262b" : "#d4dbe5"}
    >
      <XStack alignItems="center" gap="$1.5">
        <Pressable onPress={onBackPress} hitSlop={8}>
          <XStack
            width={34}
            height={34}
            borderRadius={9}
            alignItems="center"
            justifyContent="center"
            backgroundColor={isDark ? "#1a1c22" : "#dde4ef"}
            borderWidth={1}
            borderColor={isDark ? "#2a2e37" : "#c3cedd"}
          >
            <ArrowLeft size={16} color={isDark ? "#f5f7fb" : "#111827"} />
          </XStack>
        </Pressable>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <XStack gap="$1.5" alignItems="center" pr="$1.5">
            {sessions.map((session) => {
              const isActive = session.id === activeSessionId;
              return (
                <Pressable
                  key={session.id}
                  onPress={() => onSelect(session.id)}
                >
                  <XStack
                    minWidth={150}
                    maxWidth={210}
                    paddingLeft="$2.5"
                    paddingRight="$2"
                    height={34}
                    borderRadius={9}
                    alignItems="center"
                    gap="$2"
                    backgroundColor={isDark ? (isActive ? "#2f3239" : "#1d2026") : (isActive ? "#d6e0ec" : "#e8eff7")}
                    borderWidth={1}
                    borderColor={isDark ? (isActive ? "#50545f" : "#2c313a") : (isActive ? "#b7c6d8" : "#d2ddea")}
                  >
                    <Monitor
                      size={14}
                      color={isDark ? (isActive ? "#f8fafc" : "#c9d0dd") : (isActive ? "#1f2937" : "#475569")}
                    />
                    <Text
                      flex={1}
                      numberOfLines={1}
                      color={isDark ? (isActive ? "#f8fafc" : "#dbe2ef") : (isActive ? "#0f172a" : "#334155")}
                      fontSize={12}
                      fontWeight="500"
                    >
                      {session.name}
                    </Text>
                    <Pressable
                      hitSlop={8}
                      onPress={(event) => {
                        event.stopPropagation();
                        onClose(session.id);
                      }}
                    >
                      <X size={14} color={isDark ? (isActive ? "#f8fafc" : "#a8b2c2") : (isActive ? "#0f172a" : "#64748b")} />
                    </Pressable>
                  </XStack>
                </Pressable>
              );
            })}
          </XStack>
        </ScrollView>

        <XStack
          width={32}
          height={32}
          borderRadius={9}
          alignItems="center"
          justifyContent="center"
          backgroundColor={isDark ? "#1a1c22" : "#dde4ef"}
          borderWidth={1}
          borderColor={isDark ? "#2a2e37" : "#c3cedd"}
        >
          <Plus size={16} color={isDark ? "#f8fafc" : "#111827"} />
        </XStack>
      </XStack>
    </YStack>
  );
}
