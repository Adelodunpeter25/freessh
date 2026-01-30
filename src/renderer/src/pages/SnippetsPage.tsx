import { useState } from 'react'
import { useSnippets } from '@/hooks'
import { Snippet } from '@/types/snippet'
import { SnippetList, SnippetForm } from '@/components/snippets'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'

export function SnippetsPage() {
  const { snippets, loading, createSnippet, updateSnippet, deleteSnippet } = useSnippets()
  const [showForm, setShowForm] = useState(false)
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null)
  const [deletingSnippet, setDeletingSnippet] = useState<Snippet | null>(null)

  const handleNew = () => {
    setEditingSnippet(null)
    setShowForm(true)
  }

  const handleEdit = (snippet: Snippet) => {
    setEditingSnippet(snippet)
    setShowForm(true)
  }

  const handleSave = async (data: {
    name: string
    command: string
    description: string
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
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Snippets</h2>
        <Button onClick={handleNew} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Snippet
        </Button>
      </div>

      <div className="flex-1 overflow-auto">
        <SnippetList
          snippets={snippets}
          loading={loading}
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
