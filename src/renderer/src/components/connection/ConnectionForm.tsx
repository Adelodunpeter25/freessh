import { useState, useCallback } from 'react'
import { X, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { ConnectionConfig, AuthMethod } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface ConnectionFormProps {
  connection?: ConnectionConfig
  onConnect: (config: ConnectionConfig) => void
  onSave?: (config: ConnectionConfig) => void
  onClose: () => void
}

export function ConnectionForm({ connection, onConnect, onSave, onClose }: ConnectionFormProps) {
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

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setIsConnecting(true)
    try {
      if (connection && onSave) {
        await onSave(formData as ConnectionConfig)
        onClose()
      } else {
        await onConnect(formData as ConnectionConfig)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Operation failed')
    } finally {
      setIsConnecting(false)
    }
  }, [connection, onSave, formData, onClose, onConnect])

  return (
    <div className="fixed right-0 top-12 bottom-0 w-96 bg-background border-l border-border shadow-lg z-50 flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-semibold">
          {connection ? 'Edit Connection' : 'New Connection'}
        </h2>
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Close</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* General */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">General</h3>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Connection Name"
            required
          />

          <Input
            value={formData.host}
            onChange={(e) => setFormData({ ...formData, host: e.target.value })}
            placeholder="Host"
            required
          />

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">SSH on</span>
            <Input
              type="number"
              value={formData.port}
              onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
              className="w-24"
              required
            />
            <span className="text-sm text-muted-foreground">port</span>
          </div>
        </div>

        {/* Credentials */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">Credentials</h3>
          <Input
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            placeholder="Username"
            required
          />

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

          {formData.auth_method === 'password' && (
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
              <Textarea
                value={formData.private_key}
                onChange={(e) => setFormData({ ...formData, private_key: e.target.value })}
                placeholder="Private Key"
                rows={6}
              />
              <div className="relative">
                <Input
                  type={showPassphrase ? 'text' : 'password'}
                  value={formData.passphrase}
                  onChange={(e) => setFormData({ ...formData, passphrase: e.target.value })}
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

          {formData.auth_method === 'keyboard-interactive' && (
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="submit" className="flex-1" loading={isConnecting}>
            {connection ? 'Save Changes' : 'Connect'}
          </Button>
          <Button type="button" variant="outline" onClick={onClose} disabled={isConnecting}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
