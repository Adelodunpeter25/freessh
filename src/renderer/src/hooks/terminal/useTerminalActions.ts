import { useCallback, RefObject } from 'react'
import { Terminal as XTerm } from 'xterm'

interface UseTerminalActionsOptions {
  onFind?: () => void
  onSplit?: () => void
}

export const useTerminalActions = (xtermRef: RefObject<XTerm | null>, options?: UseTerminalActionsOptions) => {
  const clear = useCallback(() => {
    if (xtermRef.current) {
      xtermRef.current.clear()
    }
  }, [xtermRef])

  const copy = useCallback(() => {
    if (xtermRef.current) {
      const selection = xtermRef.current.getSelection()
      if (selection) {
        navigator.clipboard.writeText(selection)
      }
    }
  }, [xtermRef])

  const paste = useCallback(async () => {
    if (xtermRef.current) {
      const text = await navigator.clipboard.readText()
      xtermRef.current.paste(text)
    }
  }, [xtermRef])

  const selectAll = useCallback(() => {
    if (xtermRef.current) {
      xtermRef.current.selectAll()
    }
  }, [xtermRef])

  const find = useCallback(() => {
    options?.onFind?.()
  }, [options])

  const split = useCallback(() => {
    options?.onSplit?.()
  }, [options])

  return {
    clear,
    copy,
    paste,
    selectAll,
    find,
    split
  }
}
