import { useEffect, useMemo, useState } from 'react'
import { Dialog, Text, XStack, YStack } from 'tamagui'

import { Button, Input } from '@/components'

type VariableInputDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  variables: string[]
  onConfirm: (values: Record<string, string>) => void
}

export function VariableInputDialog({
  open,
  onOpenChange,
  variables,
  onConfirm,
}: VariableInputDialogProps) {
  const [values, setValues] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!open) return
    const initialValues: Record<string, string> = {}
    variables.forEach((v) => {
      initialValues[v] = ''
    })
    setValues(initialValues)
  }, [open, variables])

  const allFilled = useMemo(
    () => variables.every((v) => values[v]?.trim()),
    [variables, values],
  )

  const handleConfirm = () => {
    if (!allFilled) return
    onConfirm(values)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay key="overlay" opacity={0.5} backgroundColor="$shadowColor" />
        <Dialog.Content
          key="content"
          bordered
          elevate
          borderRadius="$4"
          padding="$4"
          backgroundColor="$background"
          width="88%"
          maxWidth={420}
        >
          <YStack gap="$3">
            <Dialog.Title>
              <Text fontSize={18} fontWeight="700" color="$color">
                Enter Variable Values
              </Text>
            </Dialog.Title>

            <YStack gap="$3">
              {variables.map((variable) => (
                <YStack key={variable} gap="$1.5">
                  <Text fontSize={13} fontWeight="600" color="$color">
                    {variable}
                  </Text>
                  <Input
                    value={values[variable] || ''}
                    onChangeText={(text) => setValues((prev) => ({ ...prev, [variable]: text }))}
                    placeholder={`Enter ${variable.toLowerCase()}`}
                  />
                </YStack>
              ))}
            </YStack>

            <XStack gap="$2" justifyContent="flex-end">
              <Dialog.Close asChild>
                <Button bg="$background" borderWidth={1} borderColor="$borderColor">
                  <Text color="$color">Cancel</Text>
                </Button>
              </Dialog.Close>
              <Button disabled={!allFilled} onPress={handleConfirm}>
                <Text color="$accentText">Run Command</Text>
              </Button>
            </XStack>
          </YStack>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  )
}

