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
      <KeySearchBar 
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        resultCount={resultCount}
      />

      {/* Separator */}
      <div className="h-px bg-border" />

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button onClick={onImportKey} variant="outline" className="flex-1">
          <Upload className="w-4 h-4 mr-2" />
          Import Key
        </Button>
        <Button onClick={onGenerateKey} className="flex-1">
          <Plus className="w-4 h-4 mr-2" />
          Generate Key
        </Button>
      </div>
    </div>
  )
}

