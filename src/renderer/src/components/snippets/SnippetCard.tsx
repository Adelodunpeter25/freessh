import { memo } from 'react'
import { Snippet } from '@/types/snippet'
import { Braces, Tag, Pencil } from 'lucide-react'
import { SnippetsContextMenu } from '@/components/contextmenu'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface SnippetCardProps {
  snippet: Snippet
  selected: boolean
  onSelect: (snippet: Snippet) => void
  onView: (snippet: Snippet) => void
  onEdit: (snippet: Snippet) => void
  onDelete: (snippet: Snippet) => void
}

export const SnippetCard = memo(function SnippetCard({
  snippet,
  selected,
  onSelect,
  onView,
  onEdit,
  onDelete
}: SnippetCardProps) {
  return (
    <SnippetsContextMenu
      snippet={snippet}
      onView={() => onView(snippet)}
      onEdit={() => onEdit(snippet)}
      onDelete={() => onDelete(snippet)}
    >
      <div
        className={`group flex items-center gap-4 p-4 rounded-xl border transition-all select-none animate-scale-in min-h-[88px] ${
          selected
            ? 'bg-card border-primary/50 shadow-[0_0_0_1px_hsl(var(--primary)/0.5)] cursor-pointer'
            : 'bg-card border-border hover:bg-muted/50 shadow-sm hover:shadow-md cursor-pointer'
        }`}
        onClick={(e) => {
          e.stopPropagation()
          onSelect(snippet)
        }}
        onContextMenu={(e) => {
          e.stopPropagation()
          onSelect(snippet)
        }}
        onDoubleClick={() => onView(snippet)}
      >
        <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
          <Braces className="h-5 w-5 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-foreground truncate">{snippet.name}</h3>
          <p className="text-xs text-muted-foreground truncate">
            {snippet.command}
          </p>
        </div>

        {snippet.tags && snippet.tags.length > 0 && (
          <div className="flex flex-col gap-1">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 text-primary text-xs">
              <Tag className="h-2.5 w-2.5" />
              {snippet.tags[0]}
            </span>
            {snippet.tags.length > 1 && (
              <span className="text-xs text-muted-foreground">
                +{snippet.tags.length - 1}
              </span>
            )}
          </div>
        )}

        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(snippet)
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </SnippetsContextMenu>
  )
})
