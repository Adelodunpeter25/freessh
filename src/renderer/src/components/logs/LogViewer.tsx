import { useEffect, useRef } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from '@xterm/addon-fit'
import { useThemeStore } from '@/stores/themeStore'
import 'xterm/css/xterm.css'

interface LogViewerProps {
  content: string
}

export function LogViewer({ content }: LogViewerProps) {
  const terminalRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<Terminal | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const theme = useThemeStore((state) => state.theme)

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  useEffect(() => {
    if (!terminalRef.current) return

    const terminal = new Terminal({
      cursorBlink: false,
      disableStdin: true,
      fontSize: 13,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: isDark ? '#000000' : '#ffffff',
        foreground: isDark ? '#d4d4d4' : '#000000',
        cursor: 'transparent'
      },
      scrollback: 50000
    })

    const fitAddon = new FitAddon()
    terminal.loadAddon(fitAddon)
    terminal.open(terminalRef.current)
    fitAddon.fit()

    terminal.write(content)

    xtermRef.current = terminal
    fitAddonRef.current = fitAddon

    const handleResize = () => fitAddon.fit()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      terminal.dispose()
    }
  }, [content, isDark])

  return <div ref={terminalRef} className="h-full w-full" />
}
