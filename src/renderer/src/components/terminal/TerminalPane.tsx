import { useEffect, useRef } from 'react'
import { Terminal as XTerm } from 'xterm'
import { FitAddon } from '@xterm/addon-fit'
import { useTerminalThemeStore } from '@/stores/terminalThemeStore'
import 'xterm/css/xterm.css'

interface TerminalPaneProps {
  sessionId: string
  onData: (data: string) => void
  onResize: (cols: number, rows: number) => void
  onReady: (xterm: XTerm) => void
}

export function TerminalPane({ sessionId, onData, onResize, onReady }: TerminalPaneProps) {
  const terminalRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<XTerm | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const onDataRef = useRef(onData)
  const onResizeRef = useRef(onResize)
  const theme = useTerminalThemeStore((state) => state.getTheme())

  onDataRef.current = onData
  onResizeRef.current = onResize

  // Live theme update
  useEffect(() => {
    if (xtermRef.current) {
      xtermRef.current.options.theme = theme
    }
  }, [theme])

  useEffect(() => {
    if (!terminalRef.current) return

    if (xtermRef.current) {
      xtermRef.current.dispose()
    }

    const xterm = new XTerm({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme
    })

    const fitAddon = new FitAddon()
    xterm.loadAddon(fitAddon)
    xterm.open(terminalRef.current)

    xtermRef.current = xterm
    fitAddonRef.current = fitAddon

    onReady(xterm)

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
    <div className="h-full w-full p-2" style={{ backgroundColor: theme.background }}>
      <div ref={terminalRef} className="h-full w-full" />
    </div>
  )
}
