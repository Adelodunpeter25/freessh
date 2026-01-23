import { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { formatPermissions } from '@/utils/formatPermissions'

interface PermissionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filename: string
  currentMode: number
  isDir?: boolean
  onSave: (mode: number) => Promise<void>
}

const PERMS = ['Read', 'Write', 'Execute'] as const
const ROLES = ['Owner', 'Group', 'Others'] as const

export function PermissionModal({ open, onOpenChange, filename, currentMode, isDir, onSave }: PermissionModalProps) {
  const [mode, setMode] = useState(currentMode & 0o777)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) setMode(currentMode & 0o777)
  }, [open, currentMode])

  const toggleBit = useCallback((bit: number) => setMode(m => m ^ bit), [])

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      await onSave(mode)
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }, [mode, onSave, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg animate-zoom-in">
        <DialogHeader>
          <DialogTitle className="truncate">Edit Permissions: {filename}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-4 gap-4 text-sm py-4">
          <div />
          {PERMS.map(p => <div key={p} className="text-center font-medium">{p}</div>)}
          {ROLES.map((role, ri) => (
            <>
              <div key={role} className="font-medium flex items-center">{role}</div>
              {PERMS.map((_, pi) => {
                const bit = 1 << (8 - ri * 3 - pi)
                return (
                  <div key={`${ri}-${pi}`} className="flex justify-center">
                    <Switch
                      checked={(mode & bit) !== 0}
                      onCheckedChange={() => toggleBit(bit)}
                    />
                  </div>
                )
              })}
            </>
          ))}
        </div>
        <div className="text-center font-mono text-lg py-2">{formatPermissions(mode, isDir ?? false)}</div>
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Apply'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
