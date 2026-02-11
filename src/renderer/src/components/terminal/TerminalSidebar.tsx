import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TerminalSettingsContent } from './TerminalSettingsContent'
import { TerminalSnippetsList } from './TerminalSnippetsList'
import { TerminalHistoryList } from './TerminalHistoryList'
import { Snippet } from '@/types/snippet'

interface TerminalSidebarProps {
  onClose: () => void
  onPasteSnippet: (command: string) => void
  onRunSnippet: (command: string) => void
  onEditSnippet: (snippet: Snippet) => void
  onDeleteSnippet: (snippet: Snippet) => void
  onNewSnippet: () => void
  activeSessionId: string | null
}

export function TerminalSidebar({ onClose, onPasteSnippet, onRunSnippet, onEditSnippet, onDeleteSnippet, onNewSnippet, activeSessionId }: TerminalSidebarProps) {
  const [activeTab, setActiveTab] = useState('snippets')

  const handlePasteSnippet = (snippet: Snippet) => {
    onPasteSnippet(snippet.command)
  }

  const handleRunSnippet = (snippet: Snippet) => {
    onRunSnippet(snippet.command)
  }

  const handleEditSnippet = (snippet: Snippet) => {
    onEditSnippet(snippet)
  }

  const handleDeleteSnippet = (snippet: Snippet) => {
    onDeleteSnippet(snippet)
  }

  const handleNewSnippet = () => {
    onNewSnippet()
  }

  return (
    <div className="fixed right-0 top-14 bottom-0 w-80 bg-background border-l border-border shadow-lg z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-semibold">Terminal</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="w-full rounded-none border-b">
          <TabsTrigger value="snippets" className="flex-1">
            Snippets
          </TabsTrigger>
          <TabsTrigger value="history" className="flex-1">
            History
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex-1">
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="snippets" className="m-0 flex-1 min-h-0 overflow-hidden">
          <TerminalSnippetsList 
            onPasteSnippet={handlePasteSnippet}
            onRunSnippet={handleRunSnippet}
            onEditSnippet={handleEditSnippet}
            onDeleteSnippet={handleDeleteSnippet}
            onNewSnippet={handleNewSnippet}
          />
        </TabsContent>

        <TabsContent value="history" className="m-0 flex-1 min-h-0 overflow-hidden">
          <TerminalHistoryList 
            activeSessionId={activeSessionId}
          />
        </TabsContent>

        <TabsContent value="settings" className="m-0 flex-1 min-h-0 overflow-hidden">
          <TerminalSettingsContent />
        </TabsContent>
      </Tabs>
    </div>
  )
}
