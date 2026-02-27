import { useState, useEffect } from 'react'
import { Snippet } from '@/types/snippet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Sheet } from '@/components/ui/sheet'

interface SnippetFormProps {
  isOpen: boolean
  snippet?: Snippet | null
  onClose: () => void
  onSave: (data: {
    name: string
    command: string
  }) => void
}

export function SnippetForm({ isOpen, snippet, onClose, onSave }: SnippetFormProps) {
  const [name, setName] = useState('')
  const [command, setCommand] = useState('')

  useEffect(() => {
    if (snippet) {
      setName(snippet.name)
      setCommand(snippet.command)
    } else {
      setName('')
      setCommand('')
    }
  }, [snippet, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ name, command })
    onClose()
  }

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title={snippet ? 'Edit Snippet' : 'New Snippet'}
    >
      <form id="snippet-form" onSubmit={handleSubmit} className="flex-1 overflow-auto p-4 space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Deploy to production"
            required
          />
        </div>

        <div>
          <Label htmlFor="command">Command</Label>
          <Textarea
            id="command"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="e.g., docker build -t myapp . && docker push myapp"
            rows={4}
            required
            className="font-mono text-sm"
          />
        </div>
      </form>

      <div className="flex gap-2 p-4 border-t mt-auto">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" form="snippet-form" className="flex-1">
          {snippet ? 'Update' : 'Create'}
        </Button>
      </div>
    </Sheet>
  )
}
