import { Home, Server } from "lucide-react"
import { useSessionStore } from "@/stores/sessionStore"

interface PanelSelectorProps {
  onSelect: (type: 'local' | 'remote', sessionId?: string) => void
}

export function PanelSelector({ onSelect }: PanelSelectorProps) {
  const allSessions = useSessionStore((state) => state.getAllSessions())
  const remoteSessions = allSessions.filter(s => s.session.type === 'ssh')

  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 p-6">
      <button
        onClick={() => onSelect('local')}
        className="w-full max-w-md px-6 py-4 rounded-lg border border-border bg-accent hover:bg-accent/80 hover:scale-105 transition-all cursor-pointer flex items-center gap-3"
      >
        <Home className="w-5 h-5" />
        <span className="font-medium">Local</span>
      </button>

      {remoteSessions.map(({ session, connection }) => (
        <button
          key={session.id}
          onClick={() => onSelect('remote', session.id)}
          className="w-full max-w-md px-6 py-4 rounded-lg border border-border bg-accent hover:bg-accent/80 hover:scale-105 transition-all cursor-pointer flex items-center gap-3"
        >
          <Server className="w-5 h-5" />
          <span className="font-medium">{connection?.name || session.name}</span>
        </button>
      ))}

      {remoteSessions.length === 0 && (
        <p className="text-sm text-muted-foreground mt-4">
          No remote sessions available
        </p>
      )}
    </div>
  )
}
