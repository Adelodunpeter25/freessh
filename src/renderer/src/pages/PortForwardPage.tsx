import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { TunnelList, PortForwardSidebar } from '@/components/portforward'
import { PortForwardProvider, usePortForwardContext } from '@/contexts/PortForwardContext'
import { useConnections } from '@/hooks/useConnections'
import { PortForwardConfig } from '@/types'

function PortForwardPageContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [editConfig, setEditConfig] = useState<PortForwardConfig | undefined>()
  const [deleteConfigId, setDeleteConfigId] = useState<string | null>(null)
  
  const { configs, loading, activeTunnels, connections, startTunnel, stopTunnel, createConfig, updateConfig, deleteConfig } = usePortForwardContext()
  const { connections: connectionList } = useConnections()

  const handleSave = useCallback(async (config: Omit<PortForwardConfig, 'id'>) => {
    if (editConfig) {
      await updateConfig({ ...config, id: editConfig.id })
    } else {
      await createConfig(config)
    }
    setSidebarOpen(false)
    setEditConfig(undefined)
  }, [editConfig, updateConfig, createConfig])

  const handleEdit = useCallback((config: PortForwardConfig) => {
    setEditConfig(config)
    setSidebarOpen(true)
  }, [])

  const handleDeleteClick = useCallback((id: string) => {
    setDeleteConfigId(id)
  }, [])

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteConfigId) return
    await deleteConfig(deleteConfigId)
    setDeleteConfigId(null)
  }, [deleteConfigId, deleteConfig])

  const handleNew = useCallback(() => {
    setEditConfig(undefined)
    setSidebarOpen(true)
  }, [])

  const handleCloseSidebar = useCallback(() => {
    setSidebarOpen(false)
    setEditConfig(undefined)
  }, [])

  const handleDialogClose = useCallback((open: boolean) => {
    if (!open) setDeleteConfigId(null)
  }, [])

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Port Forwarding</h2>
          <p className="text-sm text-muted-foreground">
            Manage SSH port forwarding configurations
          </p>
        </div>
        <Button onClick={handleNew} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New Port Forward
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <TunnelList
          configs={configs}
          loading={loading}
          activeTunnels={activeTunnels}
          connections={connections}
          onStart={startTunnel}
          onStop={stopTunnel}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
        />
      </div>

      <PortForwardSidebar
        isOpen={sidebarOpen}
        onClose={handleCloseSidebar}
        onSave={handleSave}
        connections={connectionList}
        editConfig={editConfig}
      />

      <ConfirmDialog
        open={!!deleteConfigId}
        onOpenChange={handleDialogClose}
        title="Delete Port Forward"
        description="Are you sure you want to delete this port forward configuration? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  )
}

export function PortForwardPage() {
  return (
    <PortForwardProvider>
      <PortForwardPageContent />
    </PortForwardProvider>
  )
}
