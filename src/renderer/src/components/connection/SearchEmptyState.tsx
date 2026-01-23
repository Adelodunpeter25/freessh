import { SearchX } from 'lucide-react'

export function SearchEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <SearchX className="h-16 w-16 text-muted-foreground/50 mb-4" />
      <h3 className="text-lg font-semibold mb-2">No results found</h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        Try adjusting your search to find what you're looking for
      </p>
    </div>
  )
}
