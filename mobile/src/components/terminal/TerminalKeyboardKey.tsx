import { Pressable } from "react-native";
import { Text, XStack, useTheme } from "tamagui";

type TerminalKeyboardKeyProps = {
  label: string;
  active?: boolean;
  wide?: boolean;
  compact?: boolean;
  emphasis?: "normal" | "strong" | "subtle";
  onPress: () => void;
};

export function TerminalKeyboardKey({
  label,
  active = false,
  wide = false,
  compact = false,
  emphasis = "normal",
  onPress,
}: TerminalKeyboardKeyProps) {
  const theme = useTheme();
  const height = compact ? 30 : 34;
  const minWidth = wide ? (compact ? 52 : 60) : compact ? 34 : 38;
  const backgroundColor = active
    ? "$backgroundPress"
    : emphasis === "strong"
      ? "$backgroundStrong"
      : emphasis === "subtle"
        ? "$background"
        : "$backgroundStrong";
  const borderColor = active
    ? "$accent"
    : emphasis === "subtle"
      ? "$backgroundPress"
      : "$borderColor";
  const textColor = active
    ? "$accent"
    : emphasis === "subtle"
      ? "$color"
      : "$color";

  return (
    <Pressable onPress={onPress}>
      <XStack
        minWidth={minWidth}
        height={height}
        paddingHorizontal={compact ? "$2" : "$2.5"}
        alignItems="center"
        justifyContent="center"
        borderRadius={compact ? 8 : 10}
        borderWidth={1}
        borderColor={borderColor}
        backgroundColor={backgroundColor}
      >
        <Text
          fontSize={compact ? 11 : 12}
          fontWeight={compact ? "500" : "600"}
          color={textColor}
        >
          {label}
        </Text>
      </XStack>
    </Pressable>
  );
}
