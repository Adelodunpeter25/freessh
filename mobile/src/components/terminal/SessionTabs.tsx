import { Pressable } from "react-native";
import { Monitor, Plus, X } from "lucide-react-native";
import { ScrollView, Text, XStack, YStack } from "tamagui";

import type { TerminalSession } from "@/stores";

type SessionTabsProps = {
  sessions: TerminalSession[];
  activeSessionId: string | null;
  isDark: boolean;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
};

export function SessionTabs({
  sessions,
  activeSessionId,
  isDark,
  onSelect,
  onClose,
}: SessionTabsProps) {
  return (
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
                  onPress={() => onSelect(session.id)}
                >
                  <XStack
                    minWidth={156}
                    maxWidth={220}
                    paddingLeft="$3"
                    paddingRight="$2.5"
                    paddingVertical="$2"
                    borderRadius={10}
                    alignItems="center"
                    gap="$2"
                    backgroundColor={isActive ? "#3f3f46" : "#27272a"}
                    borderWidth={1}
                    borderColor={isActive ? "#71717a" : "#3f3f46"}
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
                    <Pressable
                      hitSlop={8}
                      onPress={(event) => {
                        event.stopPropagation();
                        onClose(session.id);
                      }}
                    >
                      <X size={14} color={isActive ? "#fafafa" : "#a1a1aa"} />
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
          borderRadius={8}
          alignItems="center"
          justifyContent="center"
          backgroundColor={isDark ? "#27272a" : "#d4d4d8"}
          opacity={0.65}
        >
          <Plus size={16} color={isDark ? "#fafafa" : "#18181b"} />
        </XStack>
      </XStack>
    </YStack>
  );
}
