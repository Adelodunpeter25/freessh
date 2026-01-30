import { useState } from 'react'
import { Eye, EyeOff, FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { ConnectionConfig, AuthMethod } from '@/types'
import { useKeyStorage } from '@/hooks/keys/useKeyStorage'
import { toast } from 'sonner'

interface ConnectionFormCredentialsProps {
  formData: Partial<ConnectionConfig>
  onChange: (data: Partial<ConnectionConfig>) => void
  password: string
  onPasswordChange: (password: string) => void
  passphrase: string
  onPassphraseChange: (passphrase: string) => void
}

export function ConnectionFormCredentials({ 
  formData, 
  onChange, 
  password, 
  onPasswordChange, 
  passphrase, 
  onPassphraseChange 
}: ConnectionFormCredentialsProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showPassphrase, setShowPassphrase] = useState(false)
  const [keyMode, setKeyMode] = useState<'existing' | 'new'>(
    formData.key_id ? 'existing' : 'new'
  )
  const { keys, loading: keysLoading } = useKeyStorage()

  const selectedKey = keys.find(k => k.id === formData.key_id)

  const handleBrowseKey = async () => {
    try {
      const result = await window.electron.ipcRenderer.invoke('dialog:openFile')
      if (result) {
        onChange({ ...formData, private_key: result.content })
        toast.success(`Loaded key from ${result.path}`)
      }
    } catch (error) {
      toast.error('Failed to load key file')
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-foreground">Credentials</h3>
      <Input
        value={formData.username}
        onChange={(e) => onChange({ ...formData, username: e.target.value })}
        placeholder="Username"
        required
      />

      <Select
        value={formData.auth_method}
        onValueChange={(value: AuthMethod) => onChange({ ...formData, auth_method: value })}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="password">Password</SelectItem>
          <SelectItem value="publickey">Public Key</SelectItem>
        </SelectContent>
      </Select>

      {formData.auth_method === 'password' && (
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder="Password"
            className="pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      )}

      {formData.auth_method === 'publickey' && (
        <>
          <RadioGroup value={keyMode} onValueChange={(v) => setKeyMode(v as 'existing' | 'new')}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="existing" id="existing" />
              <Label htmlFor="existing">Use existing key</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="new" id="new" />
              <Label htmlFor="new">Paste new key</Label>
            </div>
          </RadioGroup>

          {keyMode === 'existing' ? (
            <div className="space-y-2">
              <Select
                value={formData.key_id || ''}
                onValueChange={(value) => onChange({ ...formData, key_id: value, private_key: '' })}
                disabled={keysLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={keysLoading ? 'Loading keys...' : 'Select a key'} />
                </SelectTrigger>
                <SelectContent>
                  {keys.length === 0 ? (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      No keys available. Create one first.
                    </div>
                  ) : (
                    keys.map((key) => (
                      <SelectItem key={key.id} value={key.id}>
                        {key.name} ({key.algorithm} {key.bits})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {selectedKey && (
                <div className="text-xs text-muted-foreground">
                  Using: {selectedKey.name} ({selectedKey.algorithm} {selectedKey.bits})
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Textarea
                value={formData.private_key}
                onChange={(e) => onChange({ ...formData, private_key: e.target.value, key_id: '' })}
                placeholder="Private Key"
                rows={6}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleBrowseKey}
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                Browse Key File
              </Button>
            </div>
          )}

          <div className="relative">
            <Input
              type={showPassphrase ? 'text' : 'password'}
              value={passphrase}
              onChange={(e) => onPassphraseChange(e.target.value)}
              placeholder="Passphrase (optional)"
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => setShowPassphrase(!showPassphrase)}
            >
              {showPassphrase ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
