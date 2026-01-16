import { Download, Upload } from 'lucide-react'

interface DropZoneOverlayProps {
  visible: boolean
  type?: 'download' | 'upload'
  message?: string
}

export function DropZoneOverlay({ 
  visible, 
  type = 'download',
  message = 'Drop files here' 
}: DropZoneOverlayProps) {
  if (!visible) return null

  const Icon = type === 'download' ? Download : Upload

  return (
    <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm z-10 rounded-lg flex flex-col items-center justify-center gap-3 pointer-events-none">
      <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
        <Icon className="w-8 h-8 text-primary" />
      </div>
      <span className="text-sm font-medium text-primary">{message}</span>
    </div>
  )
}
