import { memo } from 'react'
import { Snippet } from '@/types/snippet'
import { Braces, Tag } from 'lucide-react'
import { SnippetsContextMenu } from '@/components/contextmenu'

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
        className={`group flex items-center gap-4 p-4 rounded-xl border transition-all select-none animate-scale-in ${
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
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary shrink-0">
          <Braces className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate mb-1">{snippet.name}</h3>
          
          {snippet.description && (
            <p className="text-xs text-muted-foreground line-clamp-1 mb-1">
              {snippet.description}
            </p>
          )}
          
          <code className="text-xs font-mono text-muted-foreground line-clamp-1 block">
            {snippet.command}
          </code>
          
          {snippet.tags && snippet.tags.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap mt-2">
              {snippet.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 text-primary text-xs"
                >
                  <Tag className="h-2.5 w-2.5" />
                  {tag}
                </span>
              ))}
              {snippet.tags.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{snippet.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </SnippetsContextMenu>
  )
})
