import { ChevronDown, ChevronRight } from 'lucide-react'

interface GroupHeaderProps {
  name: string
  count: number
  isExpanded: boolean
  onToggle: () => void
}

export function GroupHeader({ name, count, isExpanded, onToggle }: GroupHeaderProps) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2 w-full px-4 py-2 hover:bg-accent/50 transition-colors"
    >
      {isExpanded ? (
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      ) : (
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      )}
      <span className="text-sm font-medium text-foreground">{name}</span>
      <span className="text-xs text-muted-foreground">({count})</span>
    </button>
  )
}
