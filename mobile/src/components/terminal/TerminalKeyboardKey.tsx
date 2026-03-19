import { Pressable } from "react-native";
import { Text, XStack, useTheme } from "tamagui";

type TerminalKeyboardKeyProps = {
  label: string;
  active?: boolean;
  wide?: boolean;
  onPress: () => void;
};

export function TerminalKeyboardKey({
  label,
  active = false,
  wide = false,
  onPress,
}: TerminalKeyboardKeyProps) {
  const theme = useTheme();

  return (
    <Pressable onPress={onPress}>
      <XStack
        minWidth={wide ? 60 : 38}
        height={34}
        paddingHorizontal="$2.5"
        alignItems="center"
        justifyContent="center"
        borderRadius={10}
        borderWidth={1}
        borderColor={active ? "$accent" : "$borderColor"}
        backgroundColor={active ? "$backgroundPress" : "$backgroundStrong"}
      >
        <Text
          fontSize={12}
          fontWeight="600"
          color={active ? "$accent" : "$color"}
        >
          {label}
        </Text>
      </XStack>
    </Pressable>
  );
}
