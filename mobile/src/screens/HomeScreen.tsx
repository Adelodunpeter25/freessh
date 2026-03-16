import { H2, Paragraph, YStack } from 'tamagui';

export function HomeScreen() {
  return (
    <YStack f={1} ai="center" jc="center" bg="$background" px="$6">
      <H2>FreeSSH Mobile</H2>
      <Paragraph size="$3" color="$placeholderColor">
        Home screen scaffold
      </Paragraph>
    </YStack>
  );
}
