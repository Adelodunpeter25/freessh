import { useState, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import { ConnectionConfig } from '@/types'
import { Button } from '@/components/ui/button'
import { Sheet } from '@/components/ui/sheet'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { useFormDirty } from '@/hooks'
import { ConnectionFormGeneral } from './ConnectionFormGeneral'
import { ConnectionFormCredentials } from './ConnectionFormCredentials'
import { keychainService } from '@/services/ipc/keychain'

interface ConnectionFormProps {
  isOpen: boolean
  connection?: ConnectionConfig
  onConnect: (config: ConnectionConfig, password?: string, passphrase?: string) => void
  onSave?: (config: ConnectionConfig, password?: string, passphrase?: string) => void
  onClose: () => void
}

export function ConnectionForm({ isOpen, connection, onConnect, onSave, onClose }: ConnectionFormProps) {
  const initialData = useMemo(() => connection || {
    id: crypto.randomUUID(),
    name: '',
    host: '',
    port: 22,
    username: '',
    auth_method: 'password',
    private_key: ''
  }, [connection])

  const [formData, setFormData] = useState<Partial<ConnectionConfig>>(initialData)
  const [password, setPassword] = useState('')
  const [passphrase, setPassphrase] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const isDirty = useFormDirty(initialData, formData)

  const handleClose = useCallback(() => {
    if (isDirty) {
      setShowConfirm(true)
    } else {
      onClose()
    }
  }, [isDirty, onClose])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setIsConnecting(true)
    try {
      const config = formData as ConnectionConfig
      
      // Store credentials in keychain
      if (config.auth_method === 'password' && password) {
        await keychainService.setPassword(config.id, password)
      } else if (config.auth_method === 'publickey' && passphrase) {
        await keychainService.setPassword(config.id + ':passphrase', passphrase)
      }
      
      if (connection && onSave) {
        await onSave(config, password, passphrase)
        onClose()
      } else {
        await onConnect(config, password, passphrase)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Operation failed')
    } finally {
      setIsConnecting(false)
    }
  }, [connection, onSave, formData, password, passphrase, onClose, onConnect])

  return (
    <>
      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="Discard changes?"
        description="You have unsaved changes. Are you sure you want to discard them?"
        onConfirm={onClose}
        confirmText="Discard"
        cancelText="Keep Editing"
      />
      <Sheet 
        isOpen={isOpen} 
        onClose={handleClose} 
        title={connection ? 'Edit Connection' : 'New Connection'}
      >
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <ConnectionFormGeneral formData={formData} onChange={setFormData} />
            <ConnectionFormCredentials 
              formData={formData} 
              onChange={setFormData}
              password={password}
              onPasswordChange={setPassword}
              passphrase={passphrase}
              onPassphraseChange={setPassphrase}
            />
          </div>

          <div className="p-4 border-t border-border bg-background">
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" loading={isConnecting}>
                {connection ? 'Save Changes' : 'Connect'}
              </Button>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isConnecting}>
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </Sheet>
    </>
  )
}
