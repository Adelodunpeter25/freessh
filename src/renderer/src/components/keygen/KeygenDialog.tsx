import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useKeygen } from '@/hooks/useKeygen'
import { KeyType } from '@/types/keygen'
import { SSHKey } from '@/types/key'
import { Copy } from 'lucide-react'
import { toast } from 'sonner'

interface KeygenDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onKeyGenerated?: (key: SSHKey) => void
}

export function KeygenDialog({ open, onOpenChange, onKeyGenerated }: KeygenDialogProps) {
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
    onOpenChange(false)
  }

  const handleSave = () => {
    if (generatedKey && onKeyGenerated && name.trim()) {
      onKeyGenerated({
        id: '',
        name: name.trim(),
        algorithm: keyType,
        bits: keyType === 'rsa' ? keySize : undefined,
        fingerprint: generatedKey.fingerprint,
        publicKey: generatedKey.public_key,
        createdAt: new Date()
      })
      toast.success('SSH key saved')
      handleClose()
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard`)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generate SSH Key</DialogTitle>
        </DialogHeader>

        {!generatedKey ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Algorithm</Label>
              <Select value={keyType} onValueChange={(v) => setKeyType(v as KeyType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rsa">RSA</SelectItem>
                  <SelectItem value="ed25519">Ed25519</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {keyType === 'rsa' && (
              <div className="space-y-2">
                <Label>Key Size</Label>
                <Select value={keySize.toString()} onValueChange={(v) => setKeySize(Number(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2048">2048 bits</SelectItem>
                    <SelectItem value="4096">4096 bits (recommended)</SelectItem>
                    <SelectItem value="8192">8192 bits</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Key Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Personal Laptop"
              />
            </div>

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
          </div>
        )}

        <DialogFooter>
          {!generatedKey ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleGenerate} disabled={loading}>
                {loading ? 'Generating...' : 'Generate'}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
              <Button onClick={handleSave} disabled={!name.trim()}>
                Save Key
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
