import { useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { KnownHostCard } from './KnownHostCard'
import { useKnownHosts } from '@/hooks/useKnownHosts'

export function KnownHostsList() {
  const { hosts, loading, removeHost } = useKnownHosts()
  const [deleteHostId, setDeleteHostId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  console.log('[KnownHostsList] Render - loading:', loading, 'hosts:', hosts)

  const handleDeleteConfirm = async () => {
    if (deleteHostId) {
      await removeHost(deleteHostId)
      setDeleteHostId(null)
      if (selectedId === deleteHostId) {
        setSelectedId(null)
      }
    }
  }

  if (loading) {
    console.log('[KnownHostsList] Showing loading state')
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading known hosts...</p>
      </div>
    )
  }

  if (hosts.length === 0) {
    console.log('[KnownHostsList] Showing empty state')
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-muted-foreground mb-2">No known hosts yet</p>
        <p className="text-sm text-muted-foreground">
          Host fingerprints will be saved when you connect to servers
        </p>
      </div>
    )
  }

  console.log('[KnownHostsList] Rendering hosts list')
  return (
    <>
      <div className="h-full" onClick={() => setSelectedId(null)}>
        <ScrollArea className="h-full">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4 p-6">
            {hosts.map((host) => (
              <KnownHostCard
                key={host.id}
                host={host}
                selected={selectedId === host.id}
                onSelect={(e) => {
                  e.stopPropagation()
                  setSelectedId(host.id)
                }}
                onRemove={setDeleteHostId}
              />
            ))}
          </div>
        </ScrollArea>
      </div>

      <ConfirmDialog
        open={!!deleteHostId}
        onOpenChange={(open) => !open && setDeleteHostId(null)}
        title="Remove Known Host"
        description="Are you sure you want to remove this host? You will be prompted to verify the fingerprint on your next connection."
        onConfirm={handleDeleteConfirm}
        confirmText="Remove"
        cancelText="Cancel"
      />
    </>
  )
}
