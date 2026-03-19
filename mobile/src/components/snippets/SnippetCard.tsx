import { Braces, Pencil, Trash2 } from "lucide-react-native";
import { Pressable } from "react-native";
import { useTheme, View } from "tamagui";

import type { Snippet } from "../../types";
import { BaseCard, ContextMenu } from "../common";

type SnippetCardProps = {
  snippet: Snippet;
  selected?: boolean;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function SnippetCard({
  snippet,
  selected = false,
  onPress,
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
      <BaseCard
        title={snippet.name}
        subtitle={snippet.command}
        icon={<Braces size={20} color="#e2e8f0" />}
        selected={selected}
        pressable={false}
        action={
          onEdit ? (
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
          ) : null
        }
      />
    </ContextMenu>
  );
}
