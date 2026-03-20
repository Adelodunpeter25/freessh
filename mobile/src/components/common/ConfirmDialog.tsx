import { Button as TButton, Dialog, Text, XStack, YStack } from "tamagui";
import { Button } from "./Button";

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  onConfirm: () => void;
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Delete",
  cancelText = "Cancel",
  destructive = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          key="overlay"
          opacity={1}
          backgroundColor="$backgroundTransparent"
        />
        <Dialog.Content
          key="content"
          bordered
          elevate
          borderRadius="$4"
          padding="$4"
          backgroundColor="$backgroundStrong"
          borderColor="$borderColor"
          borderWidth={1}
          width="85%"
          maxWidth={420}
          shadowColor="$shadowColor"
          shadowOpacity={0.3}
          shadowRadius={18}
          shadowOffset={{ width: 0, height: 10 }}
        >
          <YStack gap="$3">
            <Dialog.Title>
              <Text fontSize={18} fontWeight="700" color="$color">
                {title}
              </Text>
            </Dialog.Title>
            {description ? (
              <Dialog.Description>
                <Text fontSize={14} color="$placeholderColor">
                  {description}
                </Text>
              </Dialog.Description>
            ) : null}

            <XStack gap="$2" justifyContent="flex-end">
              <Dialog.Close asChild>
                <TButton
                  bg="$background"
                  borderWidth={1}
                  borderColor="$borderColor"
                >
                  <Text color="$color">{cancelText}</Text>
                </TButton>
              </Dialog.Close>
              <Button
                bg={destructive ? "$red10" : "$accent"}
                pressStyle={{ bg: destructive ? "$red9" : "$accentPress" }}
                onPress={() => {
                  onConfirm();
                  onOpenChange(false);
                }}
              >
                <Text color={destructive ? "$red1" : "$accentText"}>
                  {confirmText}
                </Text>
              </Button>
            </XStack>
          </YStack>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
