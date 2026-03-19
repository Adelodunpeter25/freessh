import { Pressable } from "react-native";
import { Text, XStack, useTheme } from "tamagui";

type TerminalKeyboardKeyProps = {
  label: string;
  active?: boolean;
  wide?: boolean;
  compact?: boolean;
  emphasis?: "normal" | "strong" | "subtle";
  flex?: number;
  onPress: () => void;
};

export function TerminalKeyboardKey({
  label,
  active = false,
  wide = false,
  compact = false,
  emphasis = "normal",
  flex,
  onPress,
}: TerminalKeyboardKeyProps) {
  const theme = useTheme();
  const height = compact ? 28 : 32;
  const minWidth = wide ? (compact ? 52 : 60) : compact ? 34 : 38;
  const backgroundColor = active
    ? "$backgroundPress"
    : emphasis === "strong"
      ? "$backgroundStrong"
      : emphasis === "subtle"
        ? "$backgroundPress"
        : "$backgroundStrong";
  const textColor = active
    ? "$accent"
    : "$color";

  return (
    <Pressable onPress={onPress} style={flex ? { flex } : undefined}>
      <XStack
        flex={flex}
        minWidth={minWidth}
        height={height}
        paddingHorizontal={compact ? "$2" : "$2.5"}
        alignItems="center"
        justifyContent="center"
        borderRadius={compact ? 6 : 8}
        borderWidth={0}
        backgroundColor={backgroundColor}
      >
        <Text
          fontSize={compact ? 12 : 13}
          fontWeight={compact ? "400" : "500"}
          color={textColor}
        >
          {label}
        </Text>
      </XStack>
    </Pressable>
  );
}
