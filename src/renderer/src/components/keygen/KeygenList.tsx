import { useState } from 'react'
import { KeygenHeader } from './KeygenHeader'
import { KeygenDialog } from './KeygenDialog'
import { KeyCard } from './KeyCard'
import { ScrollArea } from '@/components/ui/scroll-area'

// TODO: Replace with actual storage
const mockKeys = [
  { id: '1', fingerprint: 'SHA256:abc123...', comment: 'user@example.com', keyType: 'RSA 4096' },
  { id: '2', fingerprint: 'SHA256:def456...', comment: 'work-laptop', keyType: 'Ed25519' },
]

export function KeygenList() {
  const [showDialog, setShowDialog] = useState(false)
  const [keys] = useState(mockKeys)

  const handleDelete = (id: string) => {
    console.log('Delete key:', id)
    // TODO: Implement delete
  }

  const handleCopy = (id: string) => {
    console.log('Copy key:', id)
    // TODO: Implement copy full key
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <KeygenHeader onGenerateKey={() => setShowDialog(true)} />
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {keys.length === 0 ? (
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
                comment={key.comment}
                keyType={key.keyType}
                onDelete={() => handleDelete(key.id)}
                onCopy={() => handleCopy(key.id)}
              />
            ))
          )}
        </div>
      </ScrollArea>

      <KeygenDialog
        open={showDialog}
        onOpenChange={setShowDialog}
      />
    </div>
  )
}
