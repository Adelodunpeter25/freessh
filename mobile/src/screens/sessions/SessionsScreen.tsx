import { useEffect, useMemo, useRef } from 'react'
import { Pressable } from 'react-native'
import { ScrollView, Text, XStack, YStack } from 'tamagui'
import { useNavigation } from '@react-navigation/native'

import { EmptyState, AppHeader, Terminal, TerminalScreen } from '@/components'
import type { TerminalHandle } from '@/components'
import { useTerminalStore } from '@/stores'

export function SessionsScreen() {
  const navigation = useNavigation()
  const sessions = useTerminalStore((s) => s.sessions)
  const activeSessionId = useTerminalStore((s) => s.activeSessionId)
  const setActiveSession = useTerminalStore((s) => s.setActiveSession)
  const closeSession = useTerminalStore((s) => s.closeSession)
  const sendInput = useTerminalStore((s) => s.sendInput)
  const subscribeOutput = useTerminalStore((s) => s.subscribeOutput)
  const terminalRef = useRef<TerminalHandle>(null)

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeSessionId) ?? null,
    [sessions, activeSessionId]
  )

  useEffect(() => {
    if (!activeSessionId) return
    terminalRef.current?.clear()
    const unsubscribe = subscribeOutput(activeSessionId, (data) => {
      terminalRef.current?.write(data)
    })
    return () => unsubscribe()
  }, [activeSessionId, subscribeOutput])

  return (
    <>
      <AppHeader 
        title="Active Sessions" 
        showBackButton 
        onBackPress={() => navigation.goBack()} 
      />
      <TerminalScreen keyboardOffset={48}>
        {sessions.length === 0 ? (
          <YStack gap="$3" p="$4">
            <EmptyState
              title="No active sessions"
              description="Connect to a host to start a session."
            />
          </YStack>
        ) : (
          <YStack flex={1} gap="$2" p="$4" pt="$2">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <XStack gap="$2" paddingVertical="$2">
                {sessions.map((session) => (
                  <Pressable
                    key={session.id}
                    onPress={() => setActiveSession(session.id)}
                    onLongPress={() => closeSession(session.id)}
                  >
                    <XStack
                      paddingHorizontal="$3"
                      paddingVertical="$2"
                      borderRadius="$3"
                      backgroundColor={
                        session.id === activeSessionId ? '$accent' : '$backgroundStrong'
                      }
                    >
                      <Text
                        color={session.id === activeSessionId ? '$accentText' : '$color'}
                        fontSize={13}
                        fontWeight="600"
                      >
                        {session.name}
                      </Text>
                    </XStack>
                  </Pressable>
                ))}
              </XStack>
            </ScrollView>

            {activeSession ? (
              <YStack flex={1} borderRadius="$3" overflow="hidden">
                <Terminal
                  ref={terminalRef}
                  onInput={(data) => {
                    if (!activeSessionId) return
                    sendInput(activeSessionId, data)
                  }}
                  onReady={() => {
                    terminalRef.current?.fit()
                  }}
                  style={{ flex: 1, backgroundColor: '#0b0b0b' }}
                />
              </YStack>
            ) : null}
          </YStack>
        )}
      </TerminalScreen>
    </>
  )
}
