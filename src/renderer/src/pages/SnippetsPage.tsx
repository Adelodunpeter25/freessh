import { useState } from 'react'
import { useSnippets, useSnippetSearch } from '@/hooks/snippets'
import { Snippet } from '@/types/snippet'
import { SnippetList, SnippetForm, ViewCommandDialog, SnippetHeader } from '@/components/snippets'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'

export function SnippetsPage() {
  const { snippets, loading, createSnippet, updateSnippet, deleteSnippet } = useSnippets()
  const [searchQuery, setSearchQuery] = useState('')
  const { filteredSnippets } = useSnippetSearch(snippets, searchQuery)
  const [showForm, setShowForm] = useState(false)
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null)
  const [deletingSnippet, setDeletingSnippet] = useState<Snippet | null>(null)
  const [viewingSnippet, setViewingSnippet] = useState<Snippet | null>(null)

  const handleNew = () => {
    setEditingSnippet(null)
    setShowForm(true)
  }

  const handleView = (snippet: Snippet) => {
    setViewingSnippet(snippet)
  }

  const handleEdit = (snippet: Snippet) => {
    setEditingSnippet(snippet)
    setShowForm(true)
  }

  const handleSave = async (data: {
    name: string
    command: string
    tags: string[]
  }) => {
    if (editingSnippet) {
      await updateSnippet({
        id: editingSnippet.id,
        ...data
      })
    } else {
      await createSnippet(data)
    }
  }

  const handleDelete = (snippet: Snippet) => {
    setDeletingSnippet(snippet)
  }

  const handleConfirmDelete = async () => {
    if (deletingSnippet) {
      await deleteSnippet(deletingSnippet.id)
      setDeletingSnippet(null)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <SnippetHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNewSnippet={handleNew}
      />

      <div className="flex-1 overflow-auto">
        <SnippetList
          snippets={filteredSnippets}
          loading={loading}
          searchQuery={searchQuery}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <SnippetForm
        isOpen={showForm}
        snippet={editingSnippet}
        onClose={() => setShowForm(false)}
        onSave={handleSave}
      />

      <ViewCommandDialog
        isOpen={!!viewingSnippet}
        snippet={viewingSnippet}
        onClose={() => setViewingSnippet(null)}
      />

      <ConfirmDialog
        open={!!deletingSnippet}
        onOpenChange={(open) => !open && setDeletingSnippet(null)}
        title="Delete Snippet"
        description={`Are you sure you want to delete "${deletingSnippet?.name}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        confirmText="Delete"
        destructive
      />
    </div>
  )
}
