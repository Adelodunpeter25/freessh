import { useState } from 'react'
import { KeygenHeader } from './KeygenHeader'
import { KeygenSidebar } from './KeygenSidebar'
import { KeyCard } from './KeyCard'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { useKeyStorage } from '@/hooks/useKeyStorage'
import { SSHKey } from '@/types/key'

export function KeygenList() {
  const [showSidebar, setShowSidebar] = useState(false)
  const [deleteKeyId, setDeleteKeyId] = useState<string | null>(null)
  const [selectedKeyId, setSelectedKeyId] = useState<string | null>(null)
  const [editKey, setEditKey] = useState<SSHKey | undefined>(undefined)
  const { keys, loading, saveKey, updateKey, deleteKey } = useKeyStorage()

  const handleKeyGenerated = async (key: SSHKey) => {
    await saveKey(key)
    setShowSidebar(false)
  }

  const handleKeyUpdated = async (key: SSHKey) => {
    await updateKey(key)
    setShowSidebar(false)
    setEditKey(undefined)
  }

  const handleEdit = (key: SSHKey) => {
    setEditKey(key)
    setShowSidebar(true)
  }

  const handleCloseSidebar = () => {
    setShowSidebar(false)
    setEditKey(undefined)
  }

  const handleDeleteConfirm = async () => {
    if (deleteKeyId) {
      await deleteKey(deleteKeyId)
      setDeleteKeyId(null)
      if (selectedKeyId === deleteKeyId) {
        setSelectedKeyId(null)
      }
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <KeygenHeader onGenerateKey={() => setShowSidebar(true)} />
      </div>

      <ScrollArea className="flex-1" onClick={() => setSelectedKeyId(null)}>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4 p-6">
          {loading ? (
            <div className="col-span-full flex items-center justify-center h-64">
              <p className="text-muted-foreground">Loading keys...</p>
            </div>
          ) : keys.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center h-64 text-center">
              <p className="text-muted-foreground mb-4">
                No SSH keys yet
              </p>
              <p className="text-sm text-muted-foreground">
                Generate a key to get started
              </p>
            </div>
          ) : (
            keys.map((key) => (
              <KeyCard
                key={key.id}
                fingerprint={key.fingerprint}
                comment={key.name}
                keyType={key.algorithm === 'ed25519' ? 'Ed25519' : `RSA ${key.bits || 4096}`}
                selected={selectedKeyId === key.id}
                onSelect={() => setSelectedKeyId(key.id)}
                onEdit={() => handleEdit(key)}
                onDelete={() => setDeleteKeyId(key.id)}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {showSidebar && (
        <KeygenSidebar
          onClose={handleCloseSidebar}
          onKeyGenerated={handleKeyGenerated}
          onKeyUpdated={handleKeyUpdated}
          editKey={editKey}
        />
      )}

      <ConfirmDialog
        open={!!deleteKeyId}
        onOpenChange={(open) => !open && setDeleteKeyId(null)}
        title="Delete SSH Key"
        description="Are you sure you want to delete this SSH key? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  )
}
