import { useMemo, useState } from "react";
import { Pressable } from "react-native";
import { ChevronUp, ClipboardPaste } from "lucide-react-native";
import * as Clipboard from "expo-clipboard";
import { ScrollView, Sheet, Text, XStack, YStack, useTheme } from "tamagui";

import { useTerminalActions } from "@/hooks";
import { useSnackbarStore } from "@/stores";

import {
  pinnedTerminalKeys,
  terminalKeyboardRows,
  type TerminalKeyboardKey as TerminalKeyboardKeyDefinition,
} from "@/services";
import { TerminalKeyboardKey } from "./TerminalKeyboardKey";
import { TerminalSnippetsSheet } from "./TerminalSnippetsSheet";

type TerminalAccessoryKeyboardProps = {
  onSendInput: (data: string) => void;
};

export function TerminalAccessoryKeyboard({
  onSendInput,
}: TerminalAccessoryKeyboardProps) {
  const theme = useTheme();
  const showSnackbar = useSnackbarStore((state) => state.show);
  const { sendAction, sendModifiedKey } = useTerminalActions({ sendInput: onSendInput });

  const [ctrlActive, setCtrlActive] = useState(false);
  const [altActive, setAltActive] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [showSnippets, setShowSnippets] = useState(false);

  const modifierState = useMemo(
    () => ({ ctrl: ctrlActive, alt: altActive }),
    [altActive, ctrlActive],
  );

  const resetModifiers = () => {
    setCtrlActive(false);
    setAltActive(false);
  };

  const handlePaste = async () => {
    try {
      const value = await Clipboard.getStringAsync();
      if (!value) {
        showSnackbar("Clipboard is empty", "info");
        return;
      }
      onSendInput(value);
    } catch (error) {
      showSnackbar("Failed to read clipboard", "error");
    }
  };

  const handleKeyPress = (key: TerminalKeyboardKeyDefinition) => {
    if (key.kind === "modifier") {
      if (key.modifier === "ctrl") {
        setCtrlActive((current) => !current);
      } else {
        setAltActive((current) => !current);
      }
      return;
    }

    if (key.kind === "paste") {
      void handlePaste();
      resetModifiers();
      return;
    }

    if (key.kind === "snippets") {
      setShowSnippets(true);
      return;
    }

    if (key.kind === "search") {
      sendAction("searchHistory");
      resetModifiers();
      return;
    }

    if (key.kind === "action") {
      sendAction(key.actionId);
      resetModifiers();
      return;
    }

    sendModifiedKey({
      key: key.value,
      ctrl: modifierState.ctrl,
      alt: modifierState.alt,
    });
    resetModifiers();
  };

  return (
    <>
      <YStack
        borderTopWidth={1}
        borderColor="$borderColor"
        backgroundColor="$background"
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 10,
            paddingVertical: 8,
            gap: 6,
            alignItems: "center",
          }}
          keyboardShouldPersistTaps="handled"
        >
          {pinnedTerminalKeys.map((key) => (
            <TerminalKeyboardKey
              key={key.id}
              label={key.label}
              wide={key.label.length > 2}
              active={
                (key.kind === "modifier" && key.modifier === "ctrl" && ctrlActive) ||
                (key.kind === "modifier" && key.modifier === "alt" && altActive)
              }
              onPress={() => handleKeyPress(key)}
            />
          ))}

          <Pressable onPress={() => setShowKeyboard(true)}>
            <XStack
              width={34}
              height={34}
              borderRadius={10}
              borderWidth={1}
              borderColor="$borderColor"
              backgroundColor="$backgroundStrong"
              alignItems="center"
              justifyContent="center"
            >
              <ChevronUp size={16} color={theme.color.get()} />
            </XStack>
          </Pressable>
        </ScrollView>
      </YStack>

      <Sheet
        modal
        dismissOnSnapToBottom
        open={showKeyboard}
        onOpenChange={setShowKeyboard}
        snapPoints={[72]}
        snapPointsMode="percent"
      >
        <Sheet.Overlay />
        <Sheet.Frame backgroundColor="$background" padding="$4">
          <Sheet.Handle />
          <YStack gap="$3">
            <XStack gap="$2" alignItems="center">
              <ClipboardPaste size={16} color={theme.accent.get()} />
              <Text fontSize={16} fontWeight="700" color="$color">
                Terminal Keyboard
              </Text>
            </XStack>

            <ScrollView showsVerticalScrollIndicator={false}>
              <YStack gap="$3" paddingBottom="$4">
                {terminalKeyboardRows.map((row) => (
                  <YStack key={row.id} gap="$2">
                    {row.label ? (
                      <Text fontSize={11} color="$placeholderColor" fontWeight="700">
                        {row.label}
                      </Text>
                    ) : null}
                    <XStack gap="$2" flexWrap="wrap">
                      {row.keys.map((key) => (
                        <TerminalKeyboardKey
                          key={key.id}
                          label={key.label}
                          wide={key.label.length > 3}
                          onPress={() => handleKeyPress(key)}
                        />
                      ))}
                    </XStack>
                  </YStack>
                ))}

                <XStack gap="$2" flexWrap="wrap" paddingTop="$1">
                  <TerminalKeyboardKey
                    label="Paste"
                    wide
                    onPress={() => handleKeyPress({ id: "paste", label: "Paste", kind: "paste" })}
                  />
                  <TerminalKeyboardKey
                    label="Search"
                    wide
                    onPress={() => handleKeyPress({ id: "search", label: "Search", kind: "search" })}
                  />
                  <TerminalKeyboardKey
                    label="Snippets"
                    wide
                    onPress={() => handleKeyPress({ id: "snippets", label: "Snippets", kind: "snippets" })}
                  />
                </XStack>
              </YStack>
            </ScrollView>
          </YStack>
        </Sheet.Frame>
      </Sheet>

      <TerminalSnippetsSheet
        open={showSnippets}
        onOpenChange={setShowSnippets}
        onExecute={(command) => onSendInput(`${command}\n`)}
      />
    </>
  );
}
