import { useEffect, useRef, memo, useCallback } from 'react'
import { Terminal as XTerm } from 'xterm'
import { FitAddon } from '@xterm/addon-fit'
import { SearchAddon } from '@xterm/addon-search'
import { WebLinksAddon } from '@xterm/addon-web-links'
import { useTerminalThemeStore } from '@/stores/terminalThemeStore'
import { useTerminalFontStore } from '@/stores/terminalFontStore'
import 'xterm/css/xterm.css'
import './terminal-search.css'

interface TerminalPaneProps {
  sessionId: string
  onData: (data: string) => void
  onResize: (cols: number, rows: number) => void
  onReady: (xterm: XTerm, searchAddon: SearchAddon) => void
  onSearchResults?: (results: { resultIndex: number, resultCount: number } | null) => void
  isActive?: boolean
  sidebarOpen?: boolean
}

export const TerminalPane = memo(function TerminalPane({
  sessionId,
  onData,
  onResize,
  onReady,
  onSearchResults,
  isActive = true,
  sidebarOpen = false
}: TerminalPaneProps) {
  const terminalRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<XTerm | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const onDataRef = useRef(onData)
  const onResizeRef = useRef(onResize)
  const onSearchResultsRef = useRef(onSearchResults)
  const fitScheduledRef = useRef(false)
  const lastResizeRef = useRef<{ cols: number; rows: number } | null>(null)
  const theme = useTerminalThemeStore((state) => state.getTheme())
  const { fontFamily, fontSize, fontWeight } = useTerminalFontStore()

  useEffect(() => {
    onDataRef.current = onData
  }, [onData])

  useEffect(() => {
    onResizeRef.current = onResize
  }, [onResize])

  useEffect(() => {
    onSearchResultsRef.current = onSearchResults
  }, [onSearchResults])

  const scheduleFit = useCallback(() => {
    if (fitScheduledRef.current) return
    fitScheduledRef.current = true

    requestAnimationFrame(() => {
      fitScheduledRef.current = false
      if (!fitAddonRef.current || !xtermRef.current || !terminalRef.current) return

      const container = terminalRef.current
      const width = container.clientWidth
      const height = container.clientHeight
      const isVisible = container.offsetParent !== null

      // Avoid resizing PTY to 0x0 when pane is hidden (e.g. workspace focus mode),
      // which can cause prompt redraw/disappearance artifacts on restore.
      if (!isVisible || width === 0 || height === 0) return

      fitAddonRef.current.fit()
      const next = { cols: xtermRef.current.cols, rows: xtermRef.current.rows }
      if (next.cols <= 0 || next.rows <= 0) return
      const prev = lastResizeRef.current
      if (!prev || prev.cols !== next.cols || prev.rows !== next.rows) {
        lastResizeRef.current = next
        onResizeRef.current(next.cols, next.rows)
      }
    })
  }, [])

  // Re-fit when sidebar opens/closes
  useEffect(() => {
    if (!xtermRef.current) return
    scheduleFit()
    const timer = window.setTimeout(() => scheduleFit(), 180)
    return () => window.clearTimeout(timer)
  }, [sidebarOpen, scheduleFit])

  // Re-fit when becoming active
  useEffect(() => {
    if (isActive && xtermRef.current) {
      scheduleFit()
      requestAnimationFrame(() => xtermRef.current?.focus())
    }
  }, [isActive, scheduleFit])

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
      xtermRef.current.options.fontWeight = fontWeight as any

      // Refit after font change
      scheduleFit()
    }
  }, [fontFamily, fontSize, fontWeight, scheduleFit])

  useEffect(() => {
    if (!terminalRef.current) return

    const xterm = new XTerm({
      cursorBlink: true,
      allowProposedApi: true,
      fontSize,
      fontFamily: fontFamily || 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
      fontWeight: fontWeight as any,
      letterSpacing: 0,
      lineHeight: 1.1,
      theme
    })

    const fitAddon = new FitAddon()
    const searchAddon = new SearchAddon()
    const webLinksAddon = new WebLinksAddon()

    xterm.loadAddon(fitAddon)
    xterm.loadAddon(searchAddon)
    xterm.loadAddon(webLinksAddon)
    xterm.open(terminalRef.current)

    searchAddon.onDidChangeResults((results) => {
      if (onSearchResultsRef.current) {
        if (!results) {
          onSearchResultsRef.current(null)
        } else {
          onSearchResultsRef.current({
            resultIndex: results.resultIndex,
            resultCount: results.resultCount
          })
        }
      }
    })

    xtermRef.current = xterm
    fitAddonRef.current = fitAddon

    onReady(xterm, searchAddon)

    scheduleFit()
    requestAnimationFrame(() => xterm.focus())

    xterm.onData((data: string) => {
      onDataRef.current(data)
    })

    const resizeHandler = () => {
      scheduleFit()
    }
    window.addEventListener('resize', resizeHandler)

    const resizeObserver = new ResizeObserver(resizeHandler)
    resizeObserver.observe(terminalRef.current)

    return () => {
      window.removeEventListener('resize', resizeHandler)
      resizeObserver.disconnect()
      xterm.dispose()
      xtermRef.current = null
      fitAddonRef.current = null
    }
  }, [onReady, scheduleFit, sessionId])

  return (
    <div className="h-full w-full" style={{ backgroundColor: theme.background }}>
      <div ref={terminalRef} className="h-full w-full" onClick={() => xtermRef.current?.focus()} />
    </div>
  )
})
