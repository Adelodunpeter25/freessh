import { createContext, useContext, ReactNode } from 'react'
import { ConnectionConfig } from '@/types'
import { HostKeyVerification } from '@/types/knownHost'

interface ConnectionsContextValue {
  connections: ConnectionConfig[]
  filteredConnections: ConnectionConfig[]
  loading: boolean
  connectingId: string | null
  selectedId: string | null
  searchQuery: string
  selectedGroup: string | null
  groups: string[]
  groupCounts: Record<string, number>
  pendingVerification: HostKeyVerification | null
  onSelect: (connection: ConnectionConfig | null) => void
  onConnect: (connection: ConnectionConfig) => void
  onOpenSFTP: (connection: ConnectionConfig) => void
  onEdit: (connection: ConnectionConfig) => void
  onDelete: (id: string) => Promise<void>
  onSearchChange: (query: string) => void
  onGroupSelect: (group: string | null) => void
  onNewConnection: () => void
  onNewLocalTerminal: () => void
  onVerificationTrust: () => void
  onVerificationCancel: () => void
}

const ConnectionsContext = createContext<ConnectionsContextValue | null>(null)

export function useConnectionsContext() {
  const context = useContext(ConnectionsContext)
  if (!context) {
    throw new Error('useConnectionsContext must be used within ConnectionsProvider')
  }
  return context
}

interface ConnectionsProviderProps {
  value: ConnectionsContextValue
  children: ReactNode
}

export function ConnectionsProvider({ value, children }: ConnectionsProviderProps) {
  return (
    <ConnectionsContext.Provider value={value}>
      {children}
    </ConnectionsContext.Provider>
  )
}
