import { useState, useEffect } from 'react'
import { Snippet } from '@/types/snippet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Sheet } from '@/components/ui/sheet'
import { X } from 'lucide-react'

interface SnippetFormProps {
  isOpen: boolean
  snippet?: Snippet | null
  onClose: () => void
  onSave: (data: {
    name: string
    command: string
    tags: string[]
  }) => void
}

export function SnippetForm({ isOpen, snippet, onClose, onSave }: SnippetFormProps) {
  const [name, setName] = useState('')
  const [command, setCommand] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])

  useEffect(() => {
    if (snippet) {
      setName(snippet.name)
      setCommand(snippet.command)
      setTags(snippet.tags || [])
    } else {
      setName('')
      setCommand('')
      setTags([])
    }
    setTagInput('')
  }, [snippet, isOpen])

  const handleAddTag = () => {
    const trimmed = tagInput.trim()
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ name, command, tags })
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

        <div>
          <Label htmlFor="tags">Tags (optional)</Label>
          <div className="flex gap-2">
            <Input
              id="tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g., docker, deploy"
            />
            <Button type="button" variant="outline" onClick={handleAddTag}>
              Add
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-primary/80"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
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
