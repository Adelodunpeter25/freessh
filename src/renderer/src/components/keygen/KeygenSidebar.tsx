import { useState } from 'react'
import { X, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useKeygen } from '@/hooks/useKeygen'
import { KeyType } from '@/types/keygen'
import { SSHKey } from '@/types/key'
import { toast } from 'sonner'

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
  const [savedKey, setSavedKey] = useState<SSHKey | null>(null) // Store saved key to show export option
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
        // Import existing key
        const saved = await onKeyImported(name.trim(), privateKeyContent, passphrase || undefined)
        setSavedKey(saved)
      } else if (generatedKey && onKeyGenerated && name.trim()) {
        const keyData = {
          id: '',
          name: name.trim(),
          algorithm: keyType,
          bits: keyType === 'rsa' ? keySize : undefined,
          publicKey: generatedKey.public_key
        }
        
        // Save key and store result to show export option
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
    // Trigger parent to open export sidebar with this key
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
      {/* Header */}
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

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isEditMode && (
          <p className="text-sm text-muted-foreground">
            Only the key name can be edited. The key itself cannot be modified.
          </p>
        )}

        {isImportMode && (
          <p className="text-sm text-muted-foreground">
            Select your existing private key file. We'll extract the public key automatically.
          </p>
        )}

        <div className="space-y-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Key Name (e.g., Personal Laptop)"
          />
        </div>

        {isImportMode && (
          <>
            <div className="space-y-2">
              <Button onClick={handleSelectFile} variant="outline" className="w-full">
                {privateKeyContent ? 'Change File' : 'Select Private Key File'}
              </Button>
              {privateKeyContent && (
                <p className="text-xs text-muted-foreground">
                  Private key loaded ({privateKeyContent.length} bytes)
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Input
                type="password"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="Passphrase (optional)"
              />
            </div>
          </>
        )}

        {!isEditMode && !isImportMode && !generatedKey && (
          <>
            <div className="space-y-2">
              <Select value={keyType} onValueChange={(v) => setKeyType(v as KeyType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Algorithm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rsa">RSA</SelectItem>
                  <SelectItem value="ed25519">Ed25519</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {keyType === 'rsa' && (
              <div className="space-y-2">
                <Select value={keySize.toString()} onValueChange={(v) => setKeySize(Number(v))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Key Size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2048">2048 bits</SelectItem>
                    <SelectItem value="4096">4096 bits (recommended)</SelectItem>
                    <SelectItem value="8192">8192 bits</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </>
        )}

        {generatedKey && (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Public Key</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(generatedKey.public_key, 'Public key')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <Textarea value={generatedKey.public_key} readOnly rows={3} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Private Key</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(generatedKey.private_key, 'Private key')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <Textarea value={generatedKey.private_key} readOnly rows={8} />
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border bg-background">
        <div className="flex gap-2">
          {isEditMode ? (
            <>
              <Button className="flex-1" onClick={handleSave} disabled={!name.trim() || saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outline" onClick={handleClose} disabled={saving}>
                Cancel
              </Button>
            </>
          ) : isImportMode ? (
            savedKey ? (
              <>
                <Button className="flex-1" onClick={handleExport}>
                  Export to Host
                </Button>
                <Button variant="outline" onClick={handleClose}>
                  Done
                </Button>
              </>
            ) : (
              <>
                <Button className="flex-1" onClick={handleSave} disabled={!name.trim() || !privateKeyContent || saving}>
                  {saving ? 'Importing...' : 'Import Key'}
                </Button>
                <Button variant="outline" onClick={handleClose} disabled={saving}>
                  Cancel
                </Button>
              </>
            )
          ) : !generatedKey ? (
            <>
              <Button className="flex-1" onClick={handleGenerate} disabled={loading || !name.trim()}>
                {loading ? 'Generating...' : 'Generate'}
              </Button>
              <Button variant="outline" onClick={handleClose} disabled={loading}>
                Cancel
              </Button>
            </>
          ) : savedKey ? (
            <>
              <Button className="flex-1" onClick={handleExport}>
                Export to Host
              </Button>
              <Button variant="outline" onClick={handleClose}>
                Done
              </Button>
            </>
          ) : (
            <>
              <Button className="flex-1" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Key'}
              </Button>
              <Button variant="outline" onClick={handleClose} disabled={saving}>
                Close
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
