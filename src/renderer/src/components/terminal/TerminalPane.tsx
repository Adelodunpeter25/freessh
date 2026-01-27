import { useEffect, useRef, memo } from 'react'
import { Terminal as XTerm } from 'xterm'
import { FitAddon } from '@xterm/addon-fit'
import { SearchAddon } from '@xterm/addon-search'
import { useTerminalThemeStore } from '@/stores/terminalThemeStore'
import { useTerminalFontStore } from '@/stores/terminalFontStore'
import 'xterm/css/xterm.css'
import './terminal-search.css'

interface TerminalPaneProps {
  sessionId: string
  onData: (data: string) => void
  onResize: (cols: number, rows: number) => void
  onReady: (xterm: XTerm, searchAddon: SearchAddon) => void
}

export const TerminalPane = memo(function TerminalPane({ sessionId, onData, onResize, onReady }: TerminalPaneProps) {
  const terminalRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<XTerm | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const searchAddonRef = useRef<SearchAddon | null>(null)
  const onDataRef = useRef(onData)
  const onResizeRef = useRef(onResize)
  const theme = useTerminalThemeStore((state) => state.getTheme())
  const { fontFamily, fontSize, fontWeight } = useTerminalFontStore()

  onDataRef.current = onData
  onResizeRef.current = onResize

  // Live theme update
  useEffect(() => {
    if (xtermRef.current) {
      xtermRef.current.options.theme = theme
    }
  }, [theme])

  // Live font update
  useEffect(() => {
    if (xtermRef.current) {
      xtermRef.current.options.fontFamily = fontFamily
      xtermRef.current.options.fontSize = fontSize
      xtermRef.current.options.fontWeight = fontWeight.toString()
      
      // Refit after font change
      if (fitAddonRef.current) {
        requestAnimationFrame(() => {
          if (fitAddonRef.current && xtermRef.current) {
            fitAddonRef.current.fit()
            onResizeRef.current(xtermRef.current.cols, xtermRef.current.rows)
          }
        })
      }
    }
  }, [fontFamily, fontSize, fontWeight])

  useEffect(() => {
    if (!terminalRef.current) return

    if (xtermRef.current) {
      xtermRef.current.dispose()
    }

    const xterm = new XTerm({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Courier New, monospace',
      fontWeight: 'normal',
      theme
    })

    const fitAddon = new FitAddon()
    const searchAddon = new SearchAddon()
    
    // Configure search decoration colors
    searchAddon.onDidChangeResults(() => {
      // Custom highlight colors applied via CSS
    })
    
    xterm.loadAddon(fitAddon)
    xterm.loadAddon(searchAddon)
    xterm.open(terminalRef.current)

    xtermRef.current = xterm
    fitAddonRef.current = fitAddon
    searchAddonRef.current = searchAddon

    onReady(xterm, searchAddon)

    requestAnimationFrame(() => {
      if (fitAddonRef.current && xtermRef.current) {
        fitAddonRef.current.fit()
        onResizeRef.current(xtermRef.current.cols, xtermRef.current.rows)
      }
    })

    xterm.onData((data) => onDataRef.current(data))

    const handleResize = () => {
      requestAnimationFrame(() => {
        if (fitAddonRef.current && xtermRef.current) {
          fitAddonRef.current.fit()
          onResizeRef.current(xtermRef.current.cols, xtermRef.current.rows)
        }
      })
    }
    window.addEventListener('resize', handleResize)

    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(terminalRef.current)

    return () => {
      window.removeEventListener('resize', handleResize)
      resizeObserver.disconnect()
      xterm.dispose()
      xtermRef.current = null
      fitAddonRef.current = null
    }
  }, [sessionId, onReady])

  return (
    <div className="h-full w-full" style={{ backgroundColor: theme.background }}>
      <div ref={terminalRef} className="h-full w-full" />
    </div>
  )
})
