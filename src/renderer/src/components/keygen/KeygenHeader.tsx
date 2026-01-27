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
      <div className="flex items-center gap-2">
        <Button 
          onClick={onImportKey}
          variant="secondary" 
          size="sm"
          className="font-medium hover:bg-secondary/80 hover:scale-105 transition-all"
        >
          <Upload className="h-4 w-4 mr-2" />
          IMPORT KEY
        </Button>
        <Button 
          onClick={onGenerateKey}
          size="sm"
          className="font-medium bg-orange-500 hover:bg-orange-600 text-white hover:scale-105 transition-all"
        >
          <Plus className="h-4 w-4 mr-2" />
          GENERATE KEY
        </Button>
      </div>
    </div>
  )
}

