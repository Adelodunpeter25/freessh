import { useState, useEffect } from 'react'
import { KeygenHeader } from './KeygenHeader'
import { KeygenDialog } from './KeygenDialog'
import { KeyCard } from './KeyCard'
import { ScrollArea } from '@/components/ui/scroll-area'
import { keyStorageService } from '../../services/keyStorage'
import { SSHKey } from '../../types/key'

export function KeygenList() {
  const [showDialog, setShowDialog] = useState(false)
  const [keys, setKeys] = useState<SSHKey[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadKeys()
  }, [])

  const loadKeys = async () => {
    try {
      const data = await keyStorageService.list()
      setKeys(data)
    } catch (error) {
      console.error('Failed to load keys:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyGenerated = async (key: SSHKey) => {
    try {
      const saved = await keyStorageService.save(key)
      setKeys([saved, ...keys])
    } catch (error) {
      console.error('Failed to save key:', error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await keyStorageService.delete(id)
      setKeys(keys.filter((k) => k.id !== id))
    } catch (error) {
      console.error('Failed to delete key:', error)
    }
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
                onDelete={() => handleDelete(key.id)}
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
