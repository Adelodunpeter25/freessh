import { AnimatePresence, Text, XStack } from 'tamagui'
import type { SnackbarVariant } from '@/stores'
import { useThemeStore } from '@/stores'

export type SnackbarProps = {
  open: boolean
  message: string
  variant?: SnackbarVariant
}

export function Snackbar({ open, message, variant = 'info' }: SnackbarProps) {
  const theme = useThemeStore((state) => state.theme)
  const isDark = theme === 'dark'
  const colors = {
    success: isDark ? '#16a34a' : '#22c55e',
    error: isDark ? '#dc2626' : '#ef4444',
    info: isDark ? '#0f172a' : '#0f172a',
    warning: isDark ? '#d97706' : '#f59e0b',
    text: '#ffffff',
  }

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
          backgroundColor={colors[variant]}
          animation="quick"
          enterStyle={{ opacity: 0, y: 12 }}
          exitStyle={{ opacity: 0, y: 12 }}
        >
          <Text color={colors.text}>{message}</Text>
        </XStack>
      ) : null}
    </AnimatePresence>
  )
}
