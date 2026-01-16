import { useState } from 'react'
import { X, Eye, EyeOff } from 'lucide-react'
import { ConnectionConfig, AuthMethod } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface ConnectionFormProps {
  connection?: ConnectionConfig
  onConnect: (config: ConnectionConfig) => void
  onClose: () => void
}

export function ConnectionForm({ connection, onConnect, onClose }: ConnectionFormProps) {
  const [formData, setFormData] = useState<Partial<ConnectionConfig>>(connection || {
    id: crypto.randomUUID(),
    name: '',
    host: '',
    port: 22,
    username: '',
    auth_method: 'password',
    password: '',
    private_key: '',
    passphrase: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showPassphrase, setShowPassphrase] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsConnecting(true)
    try {
      await onConnect(formData as ConnectionConfig)
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <div className="fixed right-0 top-12 bottom-0 w-96 bg-background border-l border-border shadow-lg z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-semibold">
          {connection ? 'Edit Connection' : 'New Connection'}
        </h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* General */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">General</h3>
          <div className="space-y-2">
            <Label htmlFor="name">Connection Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="My Server"
              required
            />
          </div>
        </div>

        {/* Server */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Server</h3>
          <div className="space-y-2">
            <Label htmlFor="host">Host</Label>
            <Input
              id="host"
              value={formData.host}
              onChange={(e) => setFormData({ ...formData, host: e.target.value })}
              placeholder="example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="port">Port</Label>
            <Input
              id="port"
              type="number"
              value={formData.port}
              onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
              required
            />
          </div>
        </div>

        {/* Authentication */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Authentication</h3>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="root"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="auth_method">Method</Label>
            <Select
              value={formData.auth_method}
              onValueChange={(value: AuthMethod) => setFormData({ ...formData, auth_method: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="password">Password</SelectItem>
                <SelectItem value="publickey">Public Key</SelectItem>
                <SelectItem value="keyboard-interactive">Keyboard Interactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.auth_method === 'password' && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
            </div>
          )}

          {formData.auth_method === 'publickey' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="private_key">Private Key</Label>
                <Textarea
                  id="private_key"
                  value={formData.private_key}
                  onChange={(e) => setFormData({ ...formData, private_key: e.target.value })}
                  placeholder="-----BEGIN RSA PRIVATE KEY-----"
                  rows={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="passphrase">Passphrase (optional)</Label>
                <div className="relative">
                  <Input
                    id="passphrase"
                    type={showPassphrase ? 'text' : 'password'}
                    value={formData.passphrase}
                    onChange={(e) => setFormData({ ...formData, passphrase: e.target.value })}
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
              </div>
            </>
          )}

          {formData.auth_method === 'keyboard-interactive' && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="submit" className="flex-1" loading={isConnecting}>
            {connection ? 'Save & Connect' : 'Connect'}
          </Button>
          <Button type="button" variant="outline" onClick={onClose} disabled={isConnecting}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
