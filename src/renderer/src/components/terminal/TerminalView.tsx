import { useState, useRef } from 'react'
import { TerminalPane } from './TerminalPane'
import { TerminalSearchBar } from './TerminalSearchBar'
import { TerminalContextMenu } from '@/components/contextmenu/TerminalContextMenu'
import { useTerminal } from '@/hooks/useTerminal'
import { useTerminalActions } from '@/hooks/useTerminalActions'
import { SearchAddon } from '@xterm/addon-search'
import { Terminal as XTerm } from 'xterm'

interface TerminalViewProps {
  sessionId: string
}

export function TerminalView({ sessionId }: TerminalViewProps) {
  const { sendInput, resize, setXterm } = useTerminal(sessionId)
  const [showSearch, setShowSearch] = useState(false)
  const searchAddonRef = useRef<SearchAddon | null>(null)
  const xtermRef = useRef<XTerm | null>(null)

  const actions = useTerminalActions(xtermRef.current, {
    onFind: () => setShowSearch(true),
    onSplit: () => console.log('Split not implemented')
  })

  const handleReady = (xterm: XTerm, searchAddon: SearchAddon) => {
    setXterm(xterm)
    xtermRef.current = xterm
    searchAddonRef.current = searchAddon
  }

  const handleSearch = (query: string, direction: 'next' | 'prev') => {
    if (searchAddonRef.current && query) {
      if (direction === 'next') {
        searchAddonRef.current.findNext(query)
      } else {
        searchAddonRef.current.findPrevious(query)
      }
    }
  }

  return (
    <div className="h-full w-full relative">
      {showSearch && (
        <TerminalSearchBar
          onSearch={handleSearch}
          onClose={() => setShowSearch(false)}
        />
      )}
      <TerminalContextMenu
        onCopy={actions.copy}
        onPaste={actions.paste}
        onSelectAll={actions.selectAll}
        onClear={actions.clear}
        onFind={actions.find}
        onSplit={actions.split}
      >
        <div className="h-full w-full">
          <TerminalPane
            sessionId={sessionId}
            onData={sendInput}
            onResize={(cols, rows) => resize(rows, cols)}
            onReady={handleReady}
          />
        </div>
      </TerminalContextMenu>
    </div>
  )
}
