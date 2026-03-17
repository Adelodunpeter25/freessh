import { useState } from 'react'
import { YStack } from 'tamagui'

import { AddButton, EmptyState, Screen, KeyForm } from '@/components'
import type { Key } from '@/types'

export function KeysScreen() {
  const [formVisible, setFormVisible] = useState(false)
  const [editingKey, setEditingKey] = useState<Key | undefined>()

  const handleSubmit = (data: Key) => {
    // TODO: Add to key store when implemented
    console.log('Key submitted:', data)
    setEditingKey(undefined)
  }

  const openForm = (key?: Key) => {
    setEditingKey(key)
    setFormVisible(true)
  }

  return (
    <>
      <Screen>
        <YStack gap="$4">
          <EmptyState
            title="No SSH Keys"
            description="Generate or import SSH keys for authentication."
          />
        </YStack>
      </Screen>

      <AddButton onPress={() => openForm()} />

      <KeyForm
        visible={formVisible}
        onClose={() => {
          setFormVisible(false)
          setEditingKey(undefined)
        }}
        onSubmit={handleSubmit}
        initialData={editingKey}
      />
    </>
  )
}
