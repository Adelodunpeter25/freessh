import { useEffect, useRef } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from '@xterm/addon-fit'
import { useThemeStore } from '@/stores/themeStore'
import { toast } from 'sonner'
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
    
    // Delay fit to ensure container has dimensions
    setTimeout(() => {
      fitAddon.fit()
      terminal.write(content)
      // Force scroll to top
      terminal.scrollLines(-terminal.buffer.active.length)
    }, 10)

    xtermRef.current = terminal
    fitAddonRef.current = fitAddon

    const handleResize = () => fitAddon.fit()
    window.addEventListener('resize', handleResize)

    // Show read-only toast on actual keyboard input (not modifier keys)
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only ignore pure modifier keys
      const modifierKeys = ['Control', 'Alt', 'Meta', 'Shift', 'CapsLock', 'Tab', 'Escape', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
      if (modifierKeys.includes(e.key)) {
        return
      }
      toast.info('Read-only', { duration: 1500 })
    }
    document.addEventListener('keydown', handleKeyDown, true) // Use capture phase

    return () => {
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('keydown', handleKeyDown, true)
      terminal.dispose()
    }
  }, [content, isDark])

  return <div ref={terminalRef} className="h-full w-full" />
}
