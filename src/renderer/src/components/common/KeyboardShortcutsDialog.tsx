import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useShortcutSettings, SHORTCUT_DEFINITIONS, buildShortcutKeyFromEvent, displayShortcut } from '@/hooks/keyboardshortcuts'
import type { ShortcutAction } from '@/types/keyboardshortcuts'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

interface KeyboardShortcutsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
  const { shortcuts, setShortcut, resetShortcut, resetAllShortcuts } = useShortcutSettings()
  const [editingAction, setEditingAction] = useState<ShortcutAction | null>(null)
  const [capturedShortcutPreview, setCapturedShortcutPreview] = useState<string | null>(null)

  const groupedShortcuts = useMemo(() => {
    const groups = new Map<string, typeof SHORTCUT_DEFINITIONS>()
    for (const item of SHORTCUT_DEFINITIONS) {
      if (!groups.has(item.category)) {
        groups.set(item.category, [])
      }
      groups.get(item.category)!.push(item)
    }
    return Array.from(groups.entries())
  }, [])

  useEffect(() => {
    if (!open) {
      setEditingAction(null)
      setCapturedShortcutPreview(null)
    }
  }, [open])

  useEffect(() => {
    if (!editingAction) return

    const handleCapture = (e: KeyboardEvent) => {
      e.preventDefault()
      e.stopPropagation()

      if (e.key === 'Escape') {
        setEditingAction(null)
        setCapturedShortcutPreview(null)
        return
      }

      const modifierParts: string[] = []
      if (e.ctrlKey || e.metaKey) modifierParts.push('cmd')
      if (e.shiftKey) modifierParts.push('shift')
      if (e.altKey) modifierParts.push('alt')

      if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) {
        setCapturedShortcutPreview(modifierParts.join('+'))
        return
      }

      const shortcut = buildShortcutKeyFromEvent(e)
      setCapturedShortcutPreview(shortcut)
      try {
        setShortcut(editingAction, shortcut)
        toast.success('Shortcut updated')
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to update shortcut')
      } finally {
        setEditingAction(null)
        setCapturedShortcutPreview(null)
      }
    }

    window.addEventListener('keydown', handleCapture, true)
    return () => window.removeEventListener('keydown', handleCapture, true)
  }, [editingAction, setShortcut])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          <div className="flex items-center justify-between px-1">
            <div className="text-xs text-muted-foreground">
              Tip: click Edit, then press the new shortcut. Press Esc to cancel.
            </div>
            <Button variant="outline" size="sm" onClick={() => resetAllShortcuts()}>
              Reset all
            </Button>
          </div>
          <div className="px-1 text-xs text-muted-foreground">
            Fixed tab navigation: <kbd className="px-1 py-0.5 border rounded">Cmd/Ctrl+1</kbd> Home, <kbd className="px-1 py-0.5 border rounded">Cmd/Ctrl+2</kbd> SFTP, <kbd className="px-1 py-0.5 border rounded">Cmd/Ctrl+3-9</kbd> Session tabs.
          </div>

          {groupedShortcuts.map(([category, items]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-foreground mb-3">
                {category}
              </h3>
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.action}
                    className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/50"
                  >
                    <span className="text-sm text-muted-foreground">
                      {item.description}
                    </span>
                    <div className="flex items-center gap-2">
                      <kbd
                        className={`px-2 py-1 text-xs font-semibold border rounded ${
                          editingAction === item.action
                            ? 'text-primary border-primary bg-primary/10'
                            : 'text-foreground bg-muted border-border'
                        }`}
                      >
                        {editingAction === item.action
                          ? (capturedShortcutPreview ? displayShortcut(capturedShortcutPreview) : 'Press keys...')
                          : displayShortcut(shortcuts[item.action])}
                      </kbd>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => {
                          setEditingAction(item.action)
                          setCapturedShortcutPreview(null)
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => resetShortcut(item.action)}
                      >
                        Reset
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
