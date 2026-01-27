import { Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { KeyType } from '@/types/keygen'
import { useKeygenContext } from '@/contexts/KeygenContext'

export function KeygenForm() {
  const {
    isEditMode,
    isImportMode,
    name,
    setName,
    keyType,
    setKeyType,
    keySize,
    setKeySize,
    privateKeyContent,
    handleSelectFile,
    passphrase,
    setPassphrase,
    generatedKey,
    copyToClipboard
  } = useKeygenContext()

  return (
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
  )
}
