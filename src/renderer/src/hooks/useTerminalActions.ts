import { useCallback } from 'react'
import { Terminal as XTerm } from 'xterm'

interface UseTerminalActionsOptions {
  onFind?: () => void
  onSplit?: () => void
}

export const useTerminalActions = (xterm: XTerm | null, options?: UseTerminalActionsOptions) => {
  const clear = useCallback(() => {
    if (xterm) {
      xterm.clear()
    }
  }, [xterm])

  const copy = useCallback(() => {
    if (xterm) {
      const selection = xterm.getSelection()
      if (selection) {
        navigator.clipboard.writeText(selection)
      }
    }
  }, [xterm])

  const paste = useCallback(async () => {
    if (xterm) {
      const text = await navigator.clipboard.readText()
      xterm.paste(text)
    }
  }, [xterm])

  const selectAll = useCallback(() => {
    if (xterm) {
      xterm.selectAll()
    }
  }, [xterm])

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
