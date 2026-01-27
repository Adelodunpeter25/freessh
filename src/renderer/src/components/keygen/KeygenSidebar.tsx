import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useKeygen } from '@/hooks/useKeygen'
import { KeyType } from '@/types/keygen'
import { SSHKey } from '@/types/key'
import { toast } from 'sonner'
import { KeygenForm } from './KeygenForm'
import { KeygenFooter } from './KeygenFooter'

interface KeygenSidebarProps {
  onClose: () => void
  onKeyGenerated?: (key: SSHKey, privateKey: string) => Promise<SSHKey>
  onKeyImported?: (name: string, privateKey: string, passphrase?: string) => Promise<SSHKey>
  onKeyUpdated?: (key: SSHKey) => Promise<void>
  onExportKey?: (key: SSHKey) => void
  editKey?: SSHKey
  importMode?: boolean
}

export function KeygenSidebar({ onClose, onKeyGenerated, onKeyImported, onKeyUpdated, onExportKey, editKey, importMode }: KeygenSidebarProps) {
  const [keyType, setKeyType] = useState<KeyType>(editKey?.algorithm as KeyType || 'rsa')
  const [keySize, setKeySize] = useState(editKey?.bits || 4096)
  const [name, setName] = useState(editKey?.name || '')
  const [privateKeyContent, setPrivateKeyContent] = useState('')
  const [passphrase, setPassphrase] = useState('')
  const [saving, setSaving] = useState(false)
  const [savedKey, setSavedKey] = useState<SSHKey | null>(null)
  const { loading, generatedKey, generateKey, clearGeneratedKey } = useKeygen()

  const isEditMode = !!editKey
  const isImportMode = !!importMode

  const handleGenerate = async () => {
    await generateKey({
      key_type: keyType,
      key_size: keyType === 'rsa' ? keySize : undefined
    })
  }

  const handleClose = () => {
    clearGeneratedKey()
    setName('')
    setSavedKey(null)
    onClose()
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (isEditMode && onKeyUpdated && name.trim()) {
        await onKeyUpdated({
          ...editKey,
          name: name.trim()
        })
        handleClose()
      } else if (isImportMode && onKeyImported && name.trim() && privateKeyContent) {
        const saved = await onKeyImported(name.trim(), privateKeyContent, passphrase || undefined)
        setSavedKey(saved)
        handleClose()
      } else if (generatedKey && onKeyGenerated && name.trim()) {
        const keyData = {
          id: '',
          name: name.trim(),
          algorithm: keyType,
          bits: keyType === 'rsa' ? keySize : undefined,
          publicKey: generatedKey.public_key
        }
        
        const saved = await onKeyGenerated(keyData as any, generatedKey.private_key)
        setSavedKey(saved)
      }
    } catch (error) {
      console.error('[KeygenSidebar] Save failed:', error)
      throw error
    } finally {
      setSaving(false)
    }
  }

  const handleSelectFile = async () => {
    try {
      const result = await window.electron.ipcRenderer.invoke('dialog:openFile')
      if (result && result.content) {
        setPrivateKeyContent(result.content)
      }
    } catch (error) {
      console.error('Failed to open file:', error)
    }
  }

  const handleExport = () => {
    if (savedKey && onExportKey) {
      onExportKey(savedKey)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard`)
  }

  return (
    <div className="fixed right-0 top-12 bottom-0 w-80 bg-background border-l border-border shadow-lg z-50 flex flex-col animate-fade-in">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-semibold">
          {isEditMode ? 'Edit SSH Key' : isImportMode ? 'Import SSH Key' : 'Generate SSH Key'}
        </h2>
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Close</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <KeygenForm
        isEditMode={isEditMode}
        isImportMode={isImportMode}
        name={name}
        onNameChange={setName}
        keyType={keyType}
        onKeyTypeChange={setKeyType}
        keySize={keySize}
        onKeySizeChange={setKeySize}
        privateKeyContent={privateKeyContent}
        onSelectFile={handleSelectFile}
        passphrase={passphrase}
        onPassphraseChange={setPassphrase}
        generatedKey={generatedKey}
        onCopyToClipboard={copyToClipboard}
      />

      <KeygenFooter
        isEditMode={isEditMode}
        isImportMode={isImportMode}
        generatedKey={generatedKey}
        savedKey={savedKey}
        name={name}
        privateKeyContent={privateKeyContent}
        saving={saving}
        loading={loading}
        onSave={handleSave}
        onGenerate={handleGenerate}
        onExport={handleExport}
        onClose={handleClose}
      />
    </div>
  )
}
