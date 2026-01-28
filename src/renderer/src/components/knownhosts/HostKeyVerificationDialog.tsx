import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Copy } from 'lucide-react'
import { HostKeyVerification } from '@/types/knownHost'
import { toast } from 'sonner'

interface HostKeyVerificationDialogProps {
  open: boolean
  verification: HostKeyVerification | null
  onTrust: () => void
  onCancel: () => void
}

export function HostKeyVerificationDialog({
  open,
  verification,
  onTrust,
  onCancel
}: HostKeyVerificationDialogProps) {
  if (!verification) return null

  const copyFingerprint = () => {
    navigator.clipboard.writeText(verification.fingerprint)
    toast.success('Fingerprint copied to clipboard')
  }

  const isNewHost = verification.status === 'new'

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            {isNewHost ? 'New Host' : 'Host Key Changed'}
          </DialogTitle>
          <DialogDescription>
            {isNewHost
              ? 'The authenticity of this host cannot be established.'
              : 'WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Host Information</p>
            <div className="bg-muted p-3 rounded-md space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hostname:</span>
                <span className="font-mono">{verification.hostname}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Port:</span>
                <span className="font-mono">{verification.port}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Key Type:</span>
                <span className="font-mono">{verification.keyType}</span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">
                {isNewHost ? 'Fingerprint' : 'New Fingerprint'}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyFingerprint}
                className="h-7 px-2"
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </Button>
            </div>
            <div className="bg-muted p-3 rounded-md">
              <p className="text-xs font-mono break-all">{verification.fingerprint}</p>
            </div>
          </div>

          {!isNewHost && verification.oldFingerprint && (
            <div>
              <p className="text-sm font-medium mb-2">Old Fingerprint</p>
              <div className="bg-muted p-3 rounded-md">
                <p className="text-xs font-mono break-all">{verification.oldFingerprint}</p>
              </div>
            </div>
          )}

          {!isNewHost && (
            <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-md">
              <p className="text-sm text-destructive">
                This could indicate a man-in-the-middle attack or that the host key has been changed.
                Only continue if you trust this connection.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onTrust} variant={isNewHost ? 'default' : 'destructive'}>
            {isNewHost ? 'Trust & Connect' : 'Trust Anyway'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
