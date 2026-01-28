import { X } from 'lucide-react'

interface PortForwardHeaderProps {
  isEdit: boolean
  onClose: () => void
}

export function PortForwardHeader({ isEdit, onClose }: PortForwardHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <h2 className="text-lg font-semibold">{isEdit ? 'Edit' : 'New'} Port Forward</h2>
      <button
        onClick={onClose}
        className="p-1 hover:bg-muted rounded-md transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  )
}
