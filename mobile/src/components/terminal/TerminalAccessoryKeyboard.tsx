import { useEffect, useMemo, useState } from "react";
import {
  InputAccessoryView,
  Keyboard,
  Platform,
  Pressable,
  View,
  type LayoutChangeEvent,
} from "react-native";
import { Keyboard as KeyboardIcon, KeyboardOff } from "lucide-react-native";
import { ScrollView, XStack, YStack, useTheme } from "tamagui";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTerminalActions } from "@/hooks";
import { useSnackbarStore, useTerminalKeyboardStore } from "@/stores";

import {
  type TerminalKeyboardKey as TerminalKeyboardKeyDefinition,
} from "@/services/terminal";
import { TerminalKeyboardKey } from "./TerminalKeyboardKey";
import { TerminalSnippetsSheet } from "./TerminalSnippetsSheet";

type TerminalAccessoryKeyboardProps = {
  onSendInput: (data: string) => void;
  onExpandedLayoutChange?: (expanded: boolean) => void;
};

export function TerminalAccessoryKeyboard({
  onSendInput,
  onExpandedLayoutChange,
}: TerminalAccessoryKeyboardProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const showSnackbar = useSnackbarStore((state) => state.show);
  const keyboardConfig = useTerminalKeyboardStore((state) => state.config);
  const { sendAction, sendModifiedKey } = useTerminalActions({ sendInput: onSendInput });

  const [ctrlActive, setCtrlActive] = useState(false);
  const [altActive, setAltActive] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [showSnippets, setShowSnippets] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(280);
  const [rowsContentHeight, setRowsContentHeight] = useState(0);
  const [footerHeight, setFooterHeight] = useState(0);
  const [nativeKeyboardVisible, setNativeKeyboardVisible] = useState(false);
  const [nativeKeyboardHeight, setNativeKeyboardHeight] = useState(0);
  const ACCESSORY_ID = "terminal-accessory";

  const modifierState = useMemo(
    () => ({ ctrl: ctrlActive, alt: altActive }),
    [altActive, ctrlActive],
  );
  const topBarKeys = useMemo(
    () => [...keyboardConfig.topBar.pinnedKeys, ...keyboardConfig.topBar.keys],
    [keyboardConfig.topBar.keys, keyboardConfig.topBar.pinnedKeys],
  );
  const visibleRows = useMemo(
    () => keyboardConfig.fullKeyboard.rows.filter((row) => row.visible !== false),
    [keyboardConfig.fullKeyboard.rows],
  );
  const rowGap = keyboardConfig.settings.compactMode ? "$2" : "$2.5";
  const containerBottomPadding = Math.max(insets.bottom, 4);
  const chromeHeight = 20 + 16 + containerBottomPadding;
  const maxExpandedHeight = Math.max(300, keyboardHeight) + insets.bottom;
  const desiredExpandedHeight = rowsContentHeight + footerHeight + chromeHeight;
  const hasMeasuredExpandedContent = rowsContentHeight > 0 && footerHeight > 0;
  const expandedHeight = hasMeasuredExpandedContent
    ? Math.min(
        maxExpandedHeight,
        Math.max(footerHeight + chromeHeight, desiredExpandedHeight),
      )
    : maxExpandedHeight;
  const scrollAreaMaxHeight = Math.max(
    0,
    expandedHeight - footerHeight - chromeHeight,
  );

  const resetModifiers = () => {
    setCtrlActive(false);
    setAltActive(false);
  };

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (event) => {
      const nextHeight = event.endCoordinates.height;
      if (nextHeight > 0) {
        setKeyboardHeight(nextHeight);
        setNativeKeyboardHeight(nextHeight);
        setNativeKeyboardVisible(true);
        if (showKeyboard) {
          setShowKeyboard(false);
        }
      }
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setNativeKeyboardVisible(false);
      setNativeKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [showKeyboard]);

  useEffect(() => {
    onExpandedLayoutChange?.(showKeyboard);
  }, [onExpandedLayoutChange, showKeyboard]);

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

  const handleFooterLayout = (event: LayoutChangeEvent) => {
    const nextHeight = Math.ceil(event.nativeEvent.layout.height);
    if (nextHeight > 0 && nextHeight !== footerHeight) {
      setFooterHeight(nextHeight);
    }
  };

  const topBar = (
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
          paddingVertical: 7,
          gap: 5,
          alignItems: "center",
        }}
        keyboardShouldPersistTaps="handled"
      >
        {topBarKeys.map((key) => (
          <TerminalKeyboardKey
            key={key.id}
            label={key.label}
            wide={key.label.length > 2}
            emphasis={
              key.kind === "modifier" ||
              key.kind === "search" ||
              key.kind === "snippets"
                ? "strong"
                : "normal"
            }
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
  );

  return (
    <>
      {/* Always render the inline top bar — visible when custom keyboard is shown or no native keyboard */}
      {(showKeyboard || !nativeKeyboardVisible) && topBar}

      {/* On iOS, also render in InputAccessoryView so it appears above the native keyboard */}
      {Platform.OS === "ios" && nativeKeyboardVisible && !showKeyboard && (
        <InputAccessoryView nativeID={ACCESSORY_ID}>
          <View style={{ height: 52 }}>
            {topBar}
          </View>
        </InputAccessoryView>
      )}

      {/* On Android, render as absolute overlay just above the keyboard */}
      {Platform.OS === "android" && nativeKeyboardVisible && !showKeyboard && (
        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: nativeKeyboardHeight,
            zIndex: 999,
          }}
        >
          <View style={{ height: 60 }}>
            {topBar}
          </View>
        </View>
      )}

      {showKeyboard ? (
        <YStack
          height={expandedHeight}
          borderTopWidth={1}
          borderColor="$borderColor"
          backgroundColor="$background"
          paddingTop="$2"
          paddingHorizontal="$3"
          paddingBottom={containerBottomPadding}
        >
          <YStack gap="$0" paddingTop="$3">
            <ScrollView
              style={{ maxHeight: scrollAreaMaxHeight }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 0 }}
              onContentSizeChange={(_, height) => {
                const nextHeight = Math.ceil(height);
                if (nextHeight !== rowsContentHeight) {
                  setRowsContentHeight(nextHeight);
                }
              }}
            >
              <YStack gap={rowGap}>
                {visibleRows.map((row) => (
                  <YStack key={row.id} gap={rowGap}>
                    <XStack gap="$1.5" flexWrap="wrap">
                      {row.keys.map((key) => (
                        <TerminalKeyboardKey
                          key={key.id}
                          label={key.label}
                          wide={key.label.length > 3}
                          compact
                          flex={1}
                          emphasis={row.id === "basic-actions" || row.id === "quick-actions" ? "strong" : "subtle"}
                          onPress={() => handleKeyPress(key)}
                        />
                      ))}
                    </XStack>
                  </YStack>
                ))}
              </YStack>
            </ScrollView>

            <XStack
              onLayout={handleFooterLayout}
              gap="$1.5"
              flexWrap="wrap"
              paddingTop="$2"
              marginTop="$2"
              borderTopWidth={1}
              borderColor="$backgroundPress"
            >
              <TerminalKeyboardKey
                label="Paste"
                wide
                compact
                flex={1}
                emphasis="strong"
                onPress={() => handleKeyPress({ id: "paste", label: "Paste", kind: "paste" })}
              />
              <TerminalKeyboardKey
                label="Search"
                wide
                compact
                flex={1}
                emphasis="strong"
                onPress={() => handleKeyPress({ id: "search", label: "Search", kind: "search" })}
              />
              <TerminalKeyboardKey
                label="Snippets"
                wide
                compact
                flex={1}
                emphasis="strong"
                onPress={() => handleKeyPress({ id: "snippets", label: "Snippets", kind: "snippets" })}
              />
            </XStack>
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
