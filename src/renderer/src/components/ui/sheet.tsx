import { useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface SheetProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  className?: string
}

export function Sheet({ isOpen, onClose, title, children, className }: SheetProps) {
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className={cn(
      'fixed right-0 top-12 bottom-0 w-80 bg-background border-l border-border shadow-lg z-50 flex flex-col animate-fade-in',
      className
    )}>
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-semibold">{title}</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      {children}
    </div>
  )
}
