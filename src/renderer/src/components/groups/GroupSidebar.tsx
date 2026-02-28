import { useState, useEffect } from 'react'
import { Sheet } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Group } from '@/types'

interface GroupSidebarProps {
  isOpen: boolean
  onClose: () => void
  group?: Group
  onSave: (name: string) => Promise<void>
}

export function GroupSidebar({ isOpen, onClose, group, onSave }: GroupSidebarProps) {
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const isEditMode = !!group
  const connectionCount = group?.connection_count ?? 0

  useEffect(() => {
    if (isOpen) {
      setName(group?.name || '')
    }
  }, [isOpen, group])

  const handleSave = async () => {
    if (!name.trim()) return

    setSaving(true)
    try {
      await onSave(name.trim())
      onClose()
    } catch (error) {
      // Error handled by hook
    } finally {
      setSaving(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSave()
    }
  }

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit group' : 'New group'}
    >
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="group-name">Group name</Label>
            <Input
              id="group-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter group name"
              autoFocus
            />
          </div>

          {isEditMode && group && (
            <div className="text-sm text-muted-foreground">
              {connectionCount === 0
                ? 'No connection'
                : `${connectionCount} ${connectionCount === 1 ? 'connection' : 'connections'}`}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-border flex gap-2">
        <Button
          variant="outline"
          onClick={onClose}
          className="flex-1"
          disabled={saving}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          className="flex-1"
          disabled={!name.trim() || saving}
        >
          {saving ? 'Saving...' : isEditMode ? 'Save' : 'Create'}
        </Button>
      </div>
    </Sheet>
  )
}
