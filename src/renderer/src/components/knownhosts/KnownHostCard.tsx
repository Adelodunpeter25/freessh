import { Button } from '@/components/ui/button'
import { Trash2, Fingerprint } from 'lucide-react'
import { KnownHost } from '@/types/knownHost'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface KnownHostCardProps {
  host: KnownHost
  selected: boolean
  onSelect: () => void
  onRemove: (id: string) => void
}

export function KnownHostCard({ host, selected, onSelect, onRemove }: KnownHostCardProps) {
  return (
    <div
      className={`group flex items-center gap-4 p-4 rounded-xl border transition-all select-none animate-scale-in ${
        selected 
          ? 'bg-card border-primary/50 shadow-[0_0_0_1px_hsl(var(--primary)/0.5)] cursor-pointer' 
          : 'bg-card border-border hover:bg-muted/50 shadow-sm hover:shadow-md cursor-pointer'
      }`}
      onClick={onSelect}
    >
      <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
        <Fingerprint className="h-7 w-7 text-primary" />
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold text-foreground truncate">{host.hostname}:{host.port}</h3>
        <p className="text-xs text-muted-foreground truncate">
          Trusted host
        </p>
      </div>

      <TooltipProvider delayDuration={150}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 h-8 w-8 text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation()
                onRemove(host.id)
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Remove host</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
