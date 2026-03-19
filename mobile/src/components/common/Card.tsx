import { ReactNode } from 'react'
import { Pressable } from 'react-native'
import { Text, XStack, YStack, View, styled } from 'tamagui'

export const Card = styled(YStack, {
  name: 'AppCard',
  borderRadius: 16,
  padding: 14,
  backgroundColor: '$backgroundStrong',
  borderWidth: 1,
  borderColor: '$borderColor',
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.03,
  shadowRadius: 3,
  elevation: 1,
})

type BaseCardProps = {
  icon: ReactNode
  title: string
  subtitle?: string | ReactNode
  action?: ReactNode
  onPress?: () => void
  onLongPress?: () => void
  pressable?: boolean
  selected?: boolean
  loading?: boolean
}

export function BaseCard({ 
  icon, 
  title, 
  subtitle, 
  action, 
  onPress, 
  onLongPress,
  pressable = true,
  selected,
  loading 
}: BaseCardProps) {
  const content = (
      <Card
        borderColor={selected ? '$accent' : '$borderColor'}
        borderWidth={selected ? 2 : 1}
        elevation={selected ? 3 : 1}
      >
        <XStack gap="$3" alignItems="center">
          {/* Icon Container */}
          <View
            width={40}
            height={40}
            borderRadius="$3"
            backgroundColor="$backgroundPress"
            alignItems="center"
            justifyContent="center"
            opacity={0.9}
          >
            {icon}
          </View>

          {/* Content */}
          <YStack flex={1}>
            <Text fontSize={16} fontWeight="600" color="$color" numberOfLines={1}>
              {title}
            </Text>
            {typeof subtitle === 'string' ? (
              <Text fontSize={12} color="$placeholderColor" numberOfLines={1}>
                {subtitle}
              </Text>
            ) : (
              subtitle
            )}
          </YStack>

          {/* Actions */}
          {action && (
            <View>
              {action}
            </View>
          )}
        </XStack>
      </Card>
  )

  if (!pressable) {
    return content
  }

  return (
    <Pressable onPress={onPress} onLongPress={onLongPress} delayLongPress={200}>
      {content}
    </Pressable>
  )
}
