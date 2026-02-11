import { useMemo } from 'react'
import { ConnectionConfig } from '@/types'

export function useConnectionFilters(
  connections: ConnectionConfig[],
  searchQuery: string,
  selectedGroup: string | null
) {
  const groupNames = useMemo(
    () => Array.from(new Set(connections.map(c => c.group).filter(Boolean))) as string[],
    [connections]
  )

  const groupCounts = useMemo(
    () => groupNames.reduce((acc, group) => {
      acc[group] = connections.filter(c => c.group === group).length
      return acc
    }, {} as Record<string, number>),
    [groupNames, connections]
  )

  const filteredConnections = useMemo(
    () => connections
      .filter(conn =>
        conn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conn.host.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conn.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .filter(conn => {
        if (searchQuery.trim()) return true
        return selectedGroup === null || conn.group === selectedGroup
      }),
    [connections, searchQuery, selectedGroup]
  )

  return {
    groupNames,
    groupCounts,
    filteredConnections,
  }
}
