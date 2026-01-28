import { Button } from '@/components/ui/button'

interface PortForwardFooterProps {
  saving: boolean
  isEdit: boolean
  canSave: boolean
  onSave: () => void
  onClose: () => void
}

export function PortForwardFooter({ saving, isEdit, canSave, onSave, onClose }: PortForwardFooterProps) {
  return (
    <div className="p-4 border-t space-y-2 bg-background">
      <Button
        onClick={onSave}
        disabled={saving || !canSave}
        className="w-full"
      >
        {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create'}
      </Button>
      <Button
        onClick={onClose}
        variant="outline"
        className="w-full"
      >
        Cancel
      </Button>
    </div>
  )
}
