import { AnimatePresence, Text, XStack } from "tamagui";
import type { SnackbarVariant } from "@/stores";

export type SnackbarProps = {
  open: boolean;
  message: string;
  variant?: SnackbarVariant;
};

export function Snackbar({ open, message, variant = "info" }: SnackbarProps) {
  const backgroundColor = {
    success: "$success",
    error: "$destructive",
    info: "$slate900",
    warning: "$warning",
  }[variant];

  return (
    <AnimatePresence>
      {open ? (
        <XStack
          position="absolute"
          bottom={24}
          left={12}
          right={12}
          borderRadius={12}
          padding={12}
          backgroundColor={backgroundColor}
          enterStyle={{ opacity: 0, y: 12 }}
          exitStyle={{ opacity: 0, y: 12 }}
          elevation={5}
        >
          <Text color="$white" fontWeight="600">{message}</Text>
        </XStack>
      ) : null}
    </AnimatePresence>
  );
}
