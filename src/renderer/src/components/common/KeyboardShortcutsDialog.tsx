import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface KeyboardShortcutsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
const modKey = isMac ? '⌘' : 'Ctrl'

const shortcuts = [
  {
    category: 'Navigation',
    items: [
      { keys: [`${modKey}+1`], description: 'Switch to Home tab' },
      { keys: [`${modKey}+2`], description: 'Switch to SFTP tab' },
      { keys: [`${modKey}+3-9`], description: 'Switch to session tabs' },
      { keys: [`${modKey}+T`], description: 'New connection' },
      { keys: [`${modKey}+L`], description: 'New local terminal' },
      { keys: [`${modKey}+W`], description: 'Close current tab' },
      { keys: [`${modKey}+,`], description: 'Open settings' },
      { keys: [`${modKey}+Shift+/`], description: 'Show keyboard shortcuts' },
    ],
  },
  {
    category: 'Terminal',
    items: [
      { keys: [`${modKey}+K`], description: 'Clear terminal' },
      { keys: [`${modKey}+F`], description: 'Search in terminal' },
    ],
  },
  {
    category: 'SFTP',
    items: [
      { keys: [`${modKey}+R`], description: 'Refresh file lists' },
      { keys: ['Delete'], description: 'Delete selected file' },
    ],
  },
]

export function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {shortcuts.map((section) => (
            <div key={section.category}>
              <h3 className="text-sm font-semibold text-foreground mb-3">
                {section.category}
              </h3>
              <div className="space-y-2">
                {section.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/50"
                  >
                    <span className="text-sm text-muted-foreground">
                      {item.description}
                    </span>
                    <div className="flex gap-1">
                      {item.keys.map((key, keyIndex) => (
                        <kbd
                          key={keyIndex}
                          className="px-2 py-1 text-xs font-semibold text-foreground bg-muted border border-border rounded"
                        >
                          {key}
                        </kbd>
                      ))}
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
