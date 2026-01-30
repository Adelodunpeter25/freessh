import { useState } from 'react'
import { Snippet } from '@/types/snippet'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tag, Copy, Check } from 'lucide-react'

interface ViewCommandDialogProps {
  isOpen: boolean
  snippet: Snippet | null
  onClose: () => void
}

export function ViewCommandDialog({ isOpen, snippet, onClose }: ViewCommandDialogProps) {
  const [copied, setCopied] = useState(false)

  if (!snippet) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet.command)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{snippet.name}</DialogTitle>
        </DialogHeader>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Command</label>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-8 px-2"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
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
