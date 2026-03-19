import { useState } from 'react'
import { YStack } from 'tamagui'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { AddButton, Screen, SearchBar, SearchEmptyState, SectionHeader, SnippetCard, AppHeader, EmptyState, ConfirmDialog, VariableInputDialog } from '@/components'
import { useSearch } from '@/hooks'
import { useSnippetStore, useSnackbarStore, useTerminalStore } from '@/stores'
import type { ConnectionsStackParamList } from '@/navigation/AppNavigator'
import type { Snippet } from '@/types'
import { parseVariables, replaceVariables } from '@/utils'

export function SnippetsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ConnectionsStackParamList>>()
  const snippets = useSnippetStore((state) => state.snippets)
  const removeSnippet = useSnippetStore((state) => state.removeSnippet)
  const activeSessionId = useTerminalStore((state) => state.activeSessionId)
  const sendInput = useTerminalStore((state) => state.sendInput)
  const showSnackbar = useSnackbarStore((state) => state.show)
  const [runVariablesOpen, setRunVariablesOpen] = useState(false)
  const [runVariables, setRunVariables] = useState<string[]>([])
  const [runSnippet, setRunSnippet] = useState<Snippet | null>(null)
  const [confirmState, setConfirmState] = useState<{
    title: string
    description?: string
    onConfirm: () => void
  } | null>(null)

  const { query, filtered, setQuery, clearQuery, isEmpty } = useSearch({
    items: snippets,
    fields: ['name', 'command'],
  })

  const showEmpty = query.length > 0 && isEmpty
  const isActuallyEmpty = snippets.length === 0

  const executeSnippetCommand = async (command: string) => {
    if (!activeSessionId) {
      showSnackbar('Open a terminal session first', 'error')
      return
    }

    const commandToSend = command.endsWith('\n') ? command : `${command}\n`
    await sendInput(activeSessionId, commandToSend)
    showSnackbar('Snippet sent to active terminal', 'success')
    // @ts-ignore
    navigation.navigate('Sessions')
  }

  const handleRunSnippet = async (snippet: Snippet) => {
    const variables = parseVariables(snippet.command)
    if (variables.length > 0) {
      setRunSnippet(snippet)
      setRunVariables(variables)
      setRunVariablesOpen(true)
      return
    }

    try {
      await executeSnippetCommand(snippet.command)
    } catch {
      showSnackbar('Failed to run snippet', 'error')
    }
  }

  return (
    <>
      <AppHeader 
        title="Snippets" 
        showBackButton 
        onBackPress={() => navigation.goBack()} 
      />
      <Screen>
        <YStack gap="$4">
          <SearchBar
            value={query}
            onChangeText={setQuery}
            onClear={clearQuery}
            placeholder="Search snippets"
          />

          {isActuallyEmpty ? (
            <EmptyState
              title="No Snippets"
              description="Create reusable command snippets for quick terminal execution."
            />
          ) : showEmpty ? (
            <SearchEmptyState query={query} />
          ) : (
            <>
              <SectionHeader title="Command Snippets" />
              <YStack gap="$3">
                {filtered.map((snippet) => (
                  <SnippetCard 
                    key={snippet.id} 
                    snippet={snippet}
                    onRun={() => handleRunSnippet(snippet)}
                    onEdit={() => navigation.navigate('SnippetForm', { snippet })}
                    onDelete={() =>
                      setConfirmState({
                        title: 'Delete snippet?',
                        description: `This will remove "${snippet.name}".`,
                        onConfirm: async () => {
                          try {
                            await removeSnippet(snippet.id)
                            showSnackbar(`Deleted "${snippet.name}"`, 'success')
                          } catch {
                            showSnackbar('Failed to delete snippet', 'error')
                          }
                        },
                      })
                    }
                  />
                ))}
              </YStack>
            </>
          )}
        </YStack>
      </Screen>

      <AddButton onPress={() => navigation.navigate('SnippetForm', {})} />

      <ConfirmDialog
        open={confirmState !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmState(null)
        }}
        title={confirmState?.title ?? ''}
        description={confirmState?.description}
        destructive
        onConfirm={() => {
          confirmState?.onConfirm()
          setConfirmState(null)
        }}
      />

      <VariableInputDialog
        open={runVariablesOpen}
        onOpenChange={setRunVariablesOpen}
        variables={runVariables}
        onConfirm={async (values) => {
          if (!runSnippet) return
          try {
            const command = replaceVariables(runSnippet.command, values)
            await executeSnippetCommand(command)
            setRunSnippet(null)
          } catch {
            showSnackbar('Failed to run snippet', 'error')
          }
        }}
      />
    </>
  )
}
