import { Button } from '@/components/ui/button'
import { Loader2, Pencil, Save } from 'lucide-react'

interface FilePreviewHeaderProps {
  filename: string
  isEditing: boolean
  isDirty: boolean
  isSaving?: boolean
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
}

export function FilePreviewHeader({ 
  filename, 
  isEditing, 
  isDirty, 
  isSaving,
  onEdit, 
  onSave, 
  onCancel
}: FilePreviewHeaderProps) {
  return (
    <div className="flex items-center justify-between px-3 py-2 border-b border-border">
      <div className="flex items-center gap-2">
        <span className="text-sm text-foreground">{filename}</span>
        {isEditing && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-primary/20 text-primary">
            Edit Mode
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {isEditing ? (
          <>
            <Button size="sm" variant="ghost" onClick={onCancel} disabled={isSaving}>
              Cancel
            </Button>
            <Button size="sm" onClick={onSave} disabled={!isDirty || isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </>
        ) : (
          <Button size="sm" variant="ghost" onClick={onEdit}>
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
        )}
      </div>
    </div>
  )
}
