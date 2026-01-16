import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface PermissionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filename: string
  currentMode: number
  onSave: (mode: number) => Promise<void>
}

const PERMS = ['r', 'w', 'x'] as const
const ROLES = ['Owner', 'Group', 'Others'] as const

export function PermissionModal({ open, onOpenChange, filename, currentMode, onSave }: PermissionModalProps) {
  const [mode, setMode] = useState(currentMode & 0o777)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) setMode(currentMode & 0o777)
  }, [open, currentMode])

  const toggleBit = (bit: number) => setMode(m => m ^ bit)

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(mode)
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle className="truncate">Permissions: {filename}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-4 gap-2 text-sm">
          <div />
          {PERMS.map(p => <div key={p} className="text-center font-medium">{p}</div>)}
          {ROLES.map((role, ri) => (
            <>
              <div key={role} className="font-medium">{role}</div>
              {PERMS.map((_, pi) => {
                const bit = 1 << (8 - ri * 3 - pi)
                return (
                  <div key={`${ri}-${pi}`} className="flex justify-center">
                    <input
                      type="checkbox"
                      checked={(mode & bit) !== 0}
                      onChange={() => toggleBit(bit)}
                      className="w-4 h-4"
                    />
                  </div>
                )
              })}
            </>
          ))}
        </div>
        <div className="text-center font-mono text-lg">{mode.toString(8).padStart(3, '0')}</div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Apply'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
