import { memo } from 'react'
import { Pencil, Key } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { KeyCardContextMenu } from '@/components/contextmenu'

interface KeyCardProps {
  fingerprint: string
  comment?: string
  keyType: string
  selected: boolean
  onSelect: () => void
  onDelete: () => void
}

export const KeyCard = memo(function KeyCard({ fingerprint, comment, keyType, selected, onSelect, onDelete }: KeyCardProps) {
  return (
    <KeyCardContextMenu
      onEdit={() => console.log('Edit key')}
      onDelete={onDelete}
      onExport={() => console.log('Export to host')}
    >
      <div
        className={`group flex items-center gap-4 p-4 rounded-xl border transition-all select-none animate-scale-in ${
          selected 
            ? 'bg-card border-primary/50 shadow-[0_0_0_1px_hsl(var(--primary)/0.5)] cursor-pointer' 
            : 'bg-card border-border hover:bg-muted/50 shadow-sm hover:shadow-md cursor-pointer'
        }`}
        onClick={(e) => {
          e.stopPropagation()
          onSelect()
        }}
        onContextMenu={(e) => {
          e.stopPropagation()
          onSelect()
        }}
      >
        <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
          <Key className="h-5 w-5 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-foreground truncate">{comment || 'Unnamed Key'}</h3>
          <p className="text-xs text-muted-foreground truncate">
            {keyType}
          </p>
        </div>

        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation()
                  console.log('Edit key')
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit key</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </KeyCardContextMenu>
  )
})
