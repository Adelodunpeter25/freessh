import { AnimatePresence, Text, XStack } from 'tamagui'

export type SnackbarProps = {
  open: boolean
  message: string
}

export function Snackbar({ open, message }: SnackbarProps) {
  return (
    <AnimatePresence>
      {open ? (
        <XStack
          position="absolute"
          bottom={24}
          left={16}
          right={16}
          borderRadius={12}
          padding={12}
          backgroundColor="$color"
          animation="quick"
          enterStyle={{ opacity: 0, y: 12 }}
          exitStyle={{ opacity: 0, y: 12 }}
        >
          <Text color="$background">{message}</Text>
        </XStack>
      ) : null}
    </AnimatePresence>
  )
}
