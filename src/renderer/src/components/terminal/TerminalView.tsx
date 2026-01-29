import { useState, useRef, useCallback } from 'react'
import { TerminalPane } from './TerminalPane'
import { TerminalSearchBar } from './TerminalSearchBar'
import { TerminalContextMenu } from '@/components/contextmenu/TerminalContextMenu'
import { useTerminal } from '@/hooks'
import { useTerminalActions } from '@/hooks'
import { useKeyboardShortcuts } from '@/hooks'
import { SearchAddon } from '@xterm/addon-search'
import { Terminal as XTerm } from 'xterm'

interface TerminalViewProps {
  sessionId: string
  isActive?: boolean
}

export function TerminalView({ sessionId, isActive = true }: TerminalViewProps) {
  const { sendInput, resize, setXterm } = useTerminal(sessionId)
  const [showSearch, setShowSearch] = useState(false)
  const [searchResults, setSearchResults] = useState<{ index: number, total: number } | null>(null)
  const searchAddonRef = useRef<SearchAddon | null>(null)
  const xtermRef = useRef<XTerm | null>(null)

  const actions = useTerminalActions(xtermRef, {
    onFind: () => setShowSearch(true),
    onSplit: () => console.log('Split not implemented')
  })

  const handleSearchResults = useCallback((results: { resultIndex: number, resultCount: number } | null) => {
    if (!results) {
      setSearchResults(null)
    } else {
      setSearchResults({
        index: results.resultIndex,
        total: results.resultCount
      })
    }
  }, [])

  const handleReady = useCallback((xterm: XTerm, searchAddon: SearchAddon) => {
    setXterm(xterm)
    xtermRef.current = xterm
    searchAddonRef.current = searchAddon
  }, [setXterm])

  // cols and rows are passed through unchanged; useTerminal.resize
  // knows that the first argument is cols and second is rows.
  const handleResize = useCallback((cols: number, rows: number) => {
    resize(cols, rows)
  }, [resize])

  const handleSearch = useCallback((query: string, direction: 'next' | 'prev') => {
    if (searchAddonRef.current && query) {
      const options = { decorations: { activeMatchColorOverviewRuler: '#ff0000' } }
      if (direction === 'next') {
        searchAddonRef.current.findNext(query, options)
      } else {
        searchAddonRef.current.findPrevious(query, options)
      }
    }
  }, [])

  const handleCloseSearch = useCallback(() => {
    if (searchAddonRef.current) {
      searchAddonRef.current.clearDecorations()
    }
    setShowSearch(false)
    setSearchResults(null)
  }, [])

  // Terminal keyboard shortcuts
  useKeyboardShortcuts({
    onClearTerminal: actions.clear,
    onSearchTerminal: () => setShowSearch(true),
  }, isActive)

  return (
    <TerminalContextMenu
      onCopy={actions.copy}
      onPaste={actions.paste}
      onSelectAll={actions.selectAll}
      onClear={actions.clear}
      onFind={actions.find}
      onSplit={actions.split}
    >
      <div className="h-full w-full relative">
        {showSearch && (
          <TerminalSearchBar
            onSearch={handleSearch}
            onClose={handleCloseSearch}
            results={searchResults}
          />
        )}
        <TerminalPane
          key={sessionId}
          sessionId={sessionId}
          onData={sendInput}
          onResize={handleResize}
          onReady={handleReady}
          onSearchResults={handleSearchResults}
          isActive={isActive}
        />
      </div>
    </TerminalContextMenu>
  )
}
