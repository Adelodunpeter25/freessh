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
  onKeyGenerated?: (key: SSHKey) => Promise<void>
}

export function KeygenSidebar({ onClose, onKeyGenerated }: KeygenSidebarProps) {
  const [keyType, setKeyType] = useState<KeyType>('rsa')
  const [keySize, setKeySize] = useState(4096)
  const [name, setName] = useState('')
  const { loading, generatedKey, generateKey, clearGeneratedKey } = useKeygen()

  const handleGenerate = async () => {
    await generateKey({
      key_type: keyType,
      key_size: keyType === 'rsa' ? keySize : undefined
    })
  }

  const handleClose = () => {
    clearGeneratedKey()
    setName('')
    onClose()
  }

  const handleSave = async () => {
    if (generatedKey && onKeyGenerated && name.trim()) {
      await onKeyGenerated({
        id: '',
        name: name.trim(),
        algorithm: keyType,
        bits: keyType === 'rsa' ? keySize : undefined,
        fingerprint: generatedKey.fingerprint,
        publicKey: generatedKey.public_key,
        createdAt: new Date()
      })
      handleClose()
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard`)
  }

  return (
    <div className="fixed right-0 top-12 bottom-0 w-96 bg-background border-l border-border shadow-lg z-50 flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-semibold">Generate SSH Key</h2>
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
        <div className="space-y-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Key Name (e.g., Personal Laptop)"
            disabled={!!generatedKey}
          />
        </div>

        {!generatedKey && (
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
                <Label>Fingerprint</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(generatedKey.fingerprint, 'Fingerprint')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <Input value={generatedKey.fingerprint} readOnly />
            </div>

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
          {!generatedKey ? (
            <>
              <Button className="flex-1" onClick={handleGenerate} disabled={loading || !name.trim()}>
                {loading ? 'Generating...' : 'Generate'}
              </Button>
              <Button variant="outline" onClick={handleClose} disabled={loading}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button className="flex-1" onClick={handleSave}>
                Save Key
              </Button>
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
