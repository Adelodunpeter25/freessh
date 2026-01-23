import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onClear: () => void
}

export function SearchBar({ value, onChange, onClear }: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleOpen = () => {
    setIsOpen(true)
  }

  const handleClose = () => {
    setIsOpen(false)
    onClear()
  }

  if (!isOpen) {
    return (
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleOpen}>
        <Search className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-1 animate-fade-in">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search files and folders..."
          className="pl-8 pr-8 h-9 w-48"
          autoFocus
        />
        {value && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={onClear}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      <Button variant="ghost" size="icon" onClick={handleClose}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
