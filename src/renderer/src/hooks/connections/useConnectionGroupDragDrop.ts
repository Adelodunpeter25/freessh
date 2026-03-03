import { DragEvent, useCallback, useMemo, useState } from 'react'
import { ConnectionConfig, Group } from '@/types'

const CONNECTION_DRAG_DATA_KEY = 'application/x-freessh-connection-id'

interface UseConnectionGroupDragDropProps {
  connections: ConnectionConfig[]
  updateConnection: (config: ConnectionConfig) => Promise<void>
  refreshGroups?: () => Promise<void>
}

export function useConnectionGroupDragDrop({
  connections,
  updateConnection,
  refreshGroups,
}: UseConnectionGroupDragDropProps) {
  const [draggingConnectionId, setDraggingConnectionId] = useState<string | null>(null)
  const [dropTargetGroupId, setDropTargetGroupId] = useState<string | null>(null)

  const connectionsById = useMemo(
    () => new Map(connections.map((connection) => [connection.id, connection])),
    [connections],
  )

  const handleConnectionDragStart = useCallback(
    (connection: ConnectionConfig, event: DragEvent<HTMLElement>) => {
      event.stopPropagation()
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData(CONNECTION_DRAG_DATA_KEY, connection.id)
      setDraggingConnectionId(connection.id)
    },
    [],
  )

  const handleConnectionDragEnd = useCallback(() => {
    setDraggingConnectionId(null)
    setDropTargetGroupId(null)
  }, [])

  const handleGroupDragOver = useCallback((group: Group, event: DragEvent<HTMLElement>) => {
    event.preventDefault()
    event.stopPropagation()
    event.dataTransfer.dropEffect = 'move'
    setDropTargetGroupId(group.id)
  }, [])

  const handleGroupDragLeave = useCallback((event: DragEvent<HTMLElement>) => {
    event.preventDefault()
    event.stopPropagation()

    const currentTarget = event.currentTarget
    const relatedTarget = event.relatedTarget as Node | null
    if (!relatedTarget || !currentTarget.contains(relatedTarget)) {
      setDropTargetGroupId(null)
    }
  }, [])

  const handleGroupDrop = useCallback(
    async (group: Group, event: DragEvent<HTMLElement>) => {
      event.preventDefault()
      event.stopPropagation()

      const connectionId =
        event.dataTransfer.getData(CONNECTION_DRAG_DATA_KEY) || draggingConnectionId

      setDropTargetGroupId(null)
      setDraggingConnectionId(null)

      if (!connectionId) return

      const connection = connectionsById.get(connectionId)
      if (!connection || connection.group === group.name) return

      await updateConnection({
        ...connection,
        group: group.name,
      })

      if (refreshGroups) {
        await refreshGroups()
      }
    },
    [connectionsById, draggingConnectionId, refreshGroups, updateConnection],
  )

  return {
    draggingConnectionId,
    dropTargetGroupId,
    handleConnectionDragStart,
    handleConnectionDragEnd,
    handleGroupDragOver,
    handleGroupDragLeave,
    handleGroupDrop,
  }
}
