import { Braces, Pencil, Play, Trash2 } from "lucide-react-native";
import { Pressable } from "react-native";
import { Text, XStack, YStack, useTheme, View } from "tamagui";

import type { Snippet } from "../../types";
import { ContextMenu } from "../common";

type SnippetCardProps = {
  snippet: Snippet;
  selected?: boolean;
  onPress?: () => void;
  onRun?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function SnippetCard({
  snippet,
  selected = false,
  onPress,
  onRun,
  onEdit,
  onDelete,
}: SnippetCardProps) {
  const theme = useTheme();

  return (
    <ContextMenu
      title={snippet.name}
      onPress={onPress}
      items={[
        {
          key: "run",
          label: "Run",
          onPress: () => onRun?.(),
          icon: <Play size={16} color={theme.accent.get()} />,
        },
        { type: "separator", key: "sep-0" },
        {
          key: "edit",
          label: "Edit",
          onPress: () => onEdit?.(),
          icon: <Pencil size={16} color={theme.accent.get()} />,
        },
        { type: "separator", key: "sep-1" },
        {
          key: "delete",
          label: "Delete",
          destructive: true,
          onPress: () => onDelete?.(),
          icon: <Trash2 size={16} color="#ef4444" />,
        },
      ]}
    >
      <View>
        <View
          backgroundColor="$background"
          borderColor={selected ? "$accent" : "$borderColor"}
          borderWidth={selected ? 2 : 0.5}
          borderRadius="$4"
          padding="$4"
          minHeight={90}
          shadowColor="$shadowColor"
          shadowOffset={{ width: 0, height: selected ? 2 : 1 }}
          shadowOpacity={selected ? 0.1 : 0.05}
          shadowRadius={selected ? 8 : 4}
          style={{ elevation: selected ? 4 : 2 }}
        >
          <XStack gap="$4" alignItems="center">
            {/* Icon Container */}
            <View
              width={44}
              height={44}
              borderRadius="$3"
              backgroundColor="$accent"
              alignItems="center"
              justifyContent="center"
              opacity={0.12}
            >
              <Braces size={20} color={theme.accent.get()} />
            </View>

            {/* Content */}
            <YStack flex={1}>
              <Text fontSize={16} fontWeight="600" color="$color">
                {snippet.name}
              </Text>
              <Text fontSize={12} color="$placeholderColor" numberOfLines={2}>
                {snippet.command}
              </Text>
            </YStack>

            {/* Actions */}
            <XStack gap="$1">
              <Pressable onPress={onRun}>
                <View
                  width={32}
                  height={32}
                  alignItems="center"
                  justifyContent="center"
                  borderRadius="$2"
                  backgroundColor="transparent"
                >
                  <Play size={16} color={theme.accent.get()} />
                </View>
              </Pressable>
              <Pressable onPress={onEdit}>
                <View
                  width={32}
                  height={32}
                  alignItems="center"
                  justifyContent="center"
                  borderRadius="$2"
                  backgroundColor="transparent"
                >
                  <Pencil size={16} color={theme.accent.get()} />
                </View>
              </Pressable>
            </XStack>
          </XStack>
        </View>
      </View>
    </ContextMenu>
  );
}
