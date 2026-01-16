import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Toggle } from '@/components/ui/toggle'
import { formatPermissions } from '@/utils/formatPermissions'

interface PermissionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filename: string
  currentMode: number
  isDir?: boolean
  onSave: (mode: number) => Promise<void>
}

const PERMS = ['r', 'w', 'x'] as const
const ROLES = ['Owner', 'Group', 'Others'] as const

export function PermissionModal({ open, onOpenChange, filename, currentMode, isDir, onSave }: PermissionModalProps) {
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
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="truncate">Edit Permissions: {filename}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-4 gap-3 text-sm py-2">
          <div />
          {PERMS.map(p => <div key={p} className="text-center font-medium uppercase">{p}</div>)}
          {ROLES.map((role, ri) => (
            <>
              <div key={role} className="font-medium flex items-center">{role}</div>
              {PERMS.map((p, pi) => {
                const bit = 1 << (8 - ri * 3 - pi)
                return (
                  <div key={`${ri}-${pi}`} className="flex justify-center">
                    <Toggle
                      pressed={(mode & bit) !== 0}
                      onPressedChange={() => toggleBit(bit)}
                      size="sm"
                      className="w-10 h-8 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                    >
                      {p}
                    </Toggle>
                  </div>
                )
              })}
            </>
          ))}
        </div>
        <div className="text-center font-mono text-lg py-2">{formatPermissions(mode, isDir ?? false)}</div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Apply'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
