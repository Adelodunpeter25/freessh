import { Snippet } from '@/types/snippet'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tag } from 'lucide-react'

interface ViewCommandDialogProps {
  isOpen: boolean
  snippet: Snippet | null
  onClose: () => void
}

export function ViewCommandDialog({ isOpen, snippet, onClose }: ViewCommandDialogProps) {
  if (!snippet) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{snippet.name}</DialogTitle>
        </DialogHeader>

        <div>
          <label className="text-sm font-medium mb-2 block">Command</label>
          <div className="w-full rounded-md border bg-muted/50 p-4">
            <pre className="text-sm font-mono whitespace-pre-wrap break-all">
              {snippet.command}
            </pre>
          </div>
        </div>

        {snippet.tags && snippet.tags.length > 0 && (
          <div>
            <label className="text-sm font-medium mb-2 block">Tags</label>
            <div className="flex flex-wrap gap-2">
              {snippet.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-sm"
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
