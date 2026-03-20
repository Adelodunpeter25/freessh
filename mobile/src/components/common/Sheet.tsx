import type { ComponentProps } from 'react'
import { Sheet as TSheet } from 'tamagui'

type AppSheetProps = ComponentProps<typeof TSheet>

function AppSheet(props: AppSheetProps) {
  return <TSheet animation={props.animation ?? 'quick'} {...props} />
}

export const Sheet = Object.assign(AppSheet, TSheet)
