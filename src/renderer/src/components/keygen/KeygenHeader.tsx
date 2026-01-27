import { Button } from '@/components/ui/button'
import { Plus, Upload } from 'lucide-react'
import { KeySearchBar } from './KeySearchBar'

interface KeygenHeaderProps {
  onGenerateKey: () => void
  onImportKey: () => void
  searchQuery: string
  onSearchChange: (query: string) => void
  resultCount: number
}

export function KeygenHeader({ onGenerateKey, onImportKey, searchQuery, onSearchChange, resultCount }: KeygenHeaderProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <KeySearchBar 
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          resultCount={resultCount}
        />
        <Button onClick={onImportKey} size="sm" variant="outline">
          <Upload className="w-4 h-4 mr-2" />
          Import
        </Button>
        <Button onClick={onGenerateKey} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Generate
        </Button>
      </div>

      {/* Separator */}
      <div className="h-px bg-border" />

      {/* Title */}
      <div>
        <h2 className="text-lg font-semibold">SSH Keys</h2>
        <p className="text-sm text-muted-foreground">
          Manage your SSH keys
        </p>
      </div>
    </div>
  )
}

