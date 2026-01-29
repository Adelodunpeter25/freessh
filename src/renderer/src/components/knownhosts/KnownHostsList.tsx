import { useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { EmptyState } from '@/components/common/EmptyState'
import { KnownHostCard } from './KnownHostCard'
import { KnownHost } from '@/types/knownHost'
import { Shield } from 'lucide-react'

interface KnownHostsListProps {
  hosts: KnownHost[]
  loading: boolean
  onRemove: (id: string) => Promise<void>
}

export function KnownHostsList({ hosts, loading, onRemove }: KnownHostsListProps) {
  const [deleteHostId, setDeleteHostId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const handleDeleteConfirm = async () => {
    if (deleteHostId) {
      await onRemove(deleteHostId)
      setDeleteHostId(null)
      if (selectedId === deleteHostId) {
        setSelectedId(null)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading known hosts...</p>
      </div>
    )
  }

  if (hosts.length === 0) {
    return (
      <EmptyState
        icon={Shield}
        title="No known hosts"
        description="Host fingerprints will be saved when you connect to servers"
      />
    )
  }

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
