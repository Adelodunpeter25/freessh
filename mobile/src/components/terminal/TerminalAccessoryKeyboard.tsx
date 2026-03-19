import { useEffect, useMemo, useState } from "react";
import {
  Keyboard,
  Platform,
  Pressable,
} from "react-native";
import { ClipboardPaste, Keyboard as KeyboardIcon, KeyboardOff } from "lucide-react-native";
import { ScrollView, Text, XStack, YStack, useTheme } from "tamagui";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  const insets = useSafeAreaInsets();
  const showSnackbar = useSnackbarStore((state) => state.show);
  const { sendAction, sendModifiedKey } = useTerminalActions({ sendInput: onSendInput });

  const [ctrlActive, setCtrlActive] = useState(false);
  const [altActive, setAltActive] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [showSnippets, setShowSnippets] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(280);

  const modifierState = useMemo(
    () => ({ ctrl: ctrlActive, alt: altActive }),
    [altActive, ctrlActive],
  );

  const resetModifiers = () => {
    setCtrlActive(false);
    setAltActive(false);
  };

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";

    const subscription = Keyboard.addListener(showEvent, (event) => {
      const nextHeight = event.endCoordinates.height;
      if (nextHeight > 0) {
        setKeyboardHeight(nextHeight);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handlePaste = () => {
    showSnackbar("Paste is temporarily disabled", "info");
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
      handlePaste();
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

          <Pressable
            onPress={() => {
              if (!showKeyboard) {
                Keyboard.dismiss();
              }
              setShowKeyboard((current) => !current);
            }}
          >
            <XStack
              width={34}
              height={34}
              borderRadius={10}
              borderWidth={1}
              borderColor={showKeyboard ? "$accent" : "$borderColor"}
              backgroundColor={showKeyboard ? "$backgroundPress" : "$backgroundStrong"}
              alignItems="center"
              justifyContent="center"
            >
              {showKeyboard ? (
                <KeyboardOff size={16} color={theme.accent.get()} />
              ) : (
                <KeyboardIcon size={16} color={theme.color.get()} />
              )}
            </XStack>
          </Pressable>
        </ScrollView>
      </YStack>

      {showKeyboard ? (
        <YStack
          position="absolute"
          left={0}
          right={0}
          bottom={0}
          height={Math.max(keyboardHeight, 260) + insets.bottom}
          borderTopWidth={1}
          borderColor="$borderColor"
          backgroundColor="$background"
          paddingTop="$3"
          paddingHorizontal="$4"
          paddingBottom={Math.max(insets.bottom, 8)}
          zIndex={50}
        >
          <YStack gap="$3" flex={1}>
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
        </YStack>
      ) : null}

      <TerminalSnippetsSheet
        open={showSnippets}
        onOpenChange={setShowSnippets}
        onExecute={(command) => onSendInput(`${command}\n`)}
      />
    </>
  );
}
