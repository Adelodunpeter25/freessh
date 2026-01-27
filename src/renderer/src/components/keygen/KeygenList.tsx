import { useState } from 'react'
import { KeygenHeader } from './KeygenHeader'
import { KeygenDialog } from './KeygenDialog'
import { KeyCard } from './KeyCard'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useKeyStorage } from '@/hooks/useKeyStorage'
import { SSHKey } from '@/types/key'

export function KeygenList() {
  const [showDialog, setShowDialog] = useState(false)
  const { keys, loading, saveKey, deleteKey } = useKeyStorage()

  const handleKeyGenerated = async (key: SSHKey) => {
    await saveKey(key)
    setShowDialog(false)
  }

  const handleCopy = (publicKey: string) => {
    navigator.clipboard.writeText(publicKey)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <KeygenHeader onGenerateKey={() => setShowDialog(true)} />
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Loading keys...</p>
            </div>
          ) : keys.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
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
                onDelete={() => deleteKey(key.id)}
                onCopy={() => handleCopy(key.publicKey)}
              />
            ))
          )}
        </div>
      </ScrollArea>

      <KeygenDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onKeyGenerated={handleKeyGenerated}
      />
    </div>
  )
}
