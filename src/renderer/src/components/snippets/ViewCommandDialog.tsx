import { useState } from 'react'
import { Snippet } from '@/types/snippet'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'

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
          <label className="text-sm font-medium mb-2 block">Command</label>
          <div className="relative w-full rounded-md border bg-muted/50 p-4">
            <pre className="text-sm font-mono whitespace-pre-wrap break-all pr-10">
              {snippet.command}
            </pre>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="absolute top-2 right-2 h-8 w-8 p-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
