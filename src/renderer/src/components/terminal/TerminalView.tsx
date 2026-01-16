import { TerminalPane } from './TerminalPane'
import { useTerminal } from '@/hooks/useTerminal'

interface TerminalViewProps {
  sessionId: string
}

export function TerminalView({ sessionId }: TerminalViewProps) {
  const { sendInput, resize, setXterm } = useTerminal(sessionId)

  return (
    <div className="h-full w-full">
      <TerminalPane
        sessionId={sessionId}
        onData={sendInput}
        onResize={(cols, rows) => resize(rows, cols)}
        onReady={setXterm}
      />
    </div>
  )
}
