import { useEffect } from "react";
import { Pressable } from "react-native";
import { ScrollView, Sheet, Text, XStack, YStack, useTheme } from "tamagui";
import { Play, TerminalSquare } from "lucide-react-native";

import { SearchBar, SearchEmptyState } from "@/components/common";
import { useSearch } from "@/hooks";
import { useSnackbarStore, useSnippetStore } from "@/stores";

type TerminalSnippetsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExecute: (command: string) => void;
};

export function TerminalSnippetsSheet({
  open,
  onOpenChange,
  onExecute,
}: TerminalSnippetsSheetProps) {
  const theme = useTheme();
  const snippets = useSnippetStore((state) => state.snippets);
  const loading = useSnippetStore((state) => state.loading);
  const initialize = useSnippetStore((state) => state.initialize);
  const showSnackbar = useSnackbarStore((state) => state.show);

  const { query, filtered, setQuery, clearQuery, isEmpty } = useSearch({
    items: snippets,
    fields: ["name", "command"],
  });

  useEffect(() => {
    if (!open) return;
    void initialize();
  }, [initialize, open]);

  return (
    <Sheet
      modal
      dismissOnSnapToBottom
      open={open}
      onOpenChange={onOpenChange}
      snapPointsMode="fit"
    >
      <Sheet.Overlay />
      <Sheet.Frame backgroundColor="$background" padding="$4" gap="$3">
        <Sheet.Handle />
        <YStack gap="$3" paddingBottom="$2">
          <Text fontSize={16} fontWeight="700" color="$color">
            Snippets
          </Text>

          <SearchBar
            value={query}
            onChangeText={setQuery}
            onClear={clearQuery}
            placeholder="Search snippets"
          />

          <ScrollView maxHeight={360} showsVerticalScrollIndicator={false}>
            <YStack gap="$2">
              {loading ? (
                <Text color="$placeholderColor">Loading snippets...</Text>
              ) : isEmpty ? (
                <SearchEmptyState query={query} />
              ) : (
                filtered.map((snippet) => (
                  <Pressable
                    key={snippet.id}
                    onPress={() => {
                      onExecute(snippet.command);
                      onOpenChange(false);
                      showSnackbar(`Executed "${snippet.name}"`, "success");
                    }}
                  >
                    <XStack
                      gap="$3"
                      alignItems="center"
                      borderWidth={1}
                      borderColor="$borderColor"
                      backgroundColor="$backgroundStrong"
                      borderRadius={12}
                      padding="$3"
                    >
                      <XStack
                        width={36}
                        height={36}
                        borderRadius={10}
                        backgroundColor="$backgroundPress"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <TerminalSquare
                          size={16}
                          color={theme.accent.get()}
                        />
                      </XStack>
                      <YStack flex={1}>
                        <Text fontSize={14} fontWeight="600" color="$color">
                          {snippet.name}
                        </Text>
                        <Text
                          fontSize={12}
                          color="$placeholderColor"
                          numberOfLines={1}
                        >
                          {snippet.command}
                        </Text>
                      </YStack>
                      <Play size={16} color={theme.accent.get()} />
                    </XStack>
                  </Pressable>
                ))
              )}
            </YStack>
          </ScrollView>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}
