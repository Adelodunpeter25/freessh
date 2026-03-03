import { useState, useCallback, useMemo, useEffect } from 'react'
import { toast } from 'sonner'
import { ConnectionConfig } from '@/types'
import { Button } from '@/components/ui/button'
import { Sheet } from '@/components/ui/sheet'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { useFormDirty } from '@/hooks'
import { ConnectionFormGeneral } from './ConnectionFormGeneral'
import { ConnectionFormCredentials } from './ConnectionFormCredentials'
import { ConnectionFormProfile } from './ConnectionFormProfile'
import { keychainService } from '@/services/ipc/keychain'

interface ConnectionFormProps {
  isOpen: boolean
  connection?: ConnectionConfig
  mode?: 'create' | 'edit'
  onConnect: (config: ConnectionConfig, password?: string, passphrase?: string) => void
  onSave?: (config: ConnectionConfig, password?: string, passphrase?: string) => void
  onClose: () => void
}

export function ConnectionForm({ isOpen, connection, mode, onConnect, onSave, onClose }: ConnectionFormProps) {
  const isEditMode = mode ? mode === 'edit' : !!connection
  const initialData = useMemo(() => connection || {
    id: crypto.randomUUID(),
    name: '',
    host: '',
    port: 22,
    username: '',
    auth_method: 'password',
    private_key: '',
    profile: {
      term: '',
      font_size: undefined,
      startup_command: '',
      startup_command_delay_ms: undefined,
    }
  }, [connection])

  const [formData, setFormData] = useState<Partial<ConnectionConfig>>(initialData)
  const [password, setPassword] = useState('')
  const [passphrase, setPassphrase] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [activeTab, setActiveTab] = useState<'general' | 'profile'>('general')

  const isDirty = useFormDirty(initialData, formData)

  useEffect(() => {
    setFormData(initialData)
    setPassword('')
    setPassphrase('')
    setActiveTab('general')
  }, [initialData, isOpen])

  const validateForm = useCallback((config: ConnectionConfig): string | null => {
    if (!config.name?.trim()) return 'Connection name is required'
    if (!config.host?.trim()) return 'Host is required'
    if (!Number.isFinite(config.port) || config.port <= 0) return 'Port must be a positive number'
    if (!config.username?.trim()) return 'Username is required'
    if (!config.auth_method) return 'Authentication method is required'
    if (config.auth_method === 'publickey' && !config.key_id && !config.private_key?.trim()) {
      return 'Private key or saved key selection is required for public key authentication'
    }
    return null
  }, [])

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
      const validationError = validateForm(config)
      if (validationError) {
        toast.error(validationError)
        return
      }
      
      // Store credentials in keychain
      if (config.auth_method === 'password' && password) {
        await keychainService.setPassword(config.id, password)
      } else if (config.auth_method === 'publickey' && passphrase) {
        await keychainService.setPassword(config.id + ':passphrase', passphrase)
      }
      
      if (isEditMode && onSave) {
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
  }, [isEditMode, onSave, formData, password, passphrase, onClose, onConnect, validateForm])

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
        title={isEditMode ? 'Edit Connection' : 'New Connection'}
      >
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'general' | 'profile')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="profile">Profile</TabsTrigger>
              </TabsList>

              <TabsContent value="general">
                <ConnectionFormGeneral formData={formData} onChange={setFormData} />
                <ConnectionFormCredentials
                  formData={formData}
                  onChange={setFormData}
                  password={password}
                  onPasswordChange={setPassword}
                  passphrase={passphrase}
                  onPassphraseChange={setPassphrase}
                />
              </TabsContent>

              <TabsContent value="profile">
                <ConnectionFormProfile formData={formData} onChange={setFormData} />
              </TabsContent>
            </Tabs>
          </div>

          <div className="p-4 border-t border-border bg-background">
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" loading={isConnecting}>
                {isEditMode ? 'Save Changes' : 'Save & Connect'}
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
