import { useCallback } from 'react'
import { Terminal as XTerm } from 'xterm'

export const useTerminalActions = (xterm: XTerm | null) => {
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
    // TODO: Implement find functionality with search addon
    console.log('Find not implemented yet')
  }, [])

  const split = useCallback(() => {
    // TODO: Implement split terminal functionality
    console.log('Split not implemented yet')
  }, [])

  return {
    clear,
    copy,
    paste,
    selectAll,
    find,
    split
  }
}
