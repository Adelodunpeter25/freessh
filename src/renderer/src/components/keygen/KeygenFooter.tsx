import { Button } from '@/components/ui/button'
import { SSHKey } from '@/types/key'
import { GeneratedKeyPair } from '@/types/keygen'

interface KeygenFooterProps {
  isEditMode: boolean
  isImportMode: boolean
  generatedKey: GeneratedKeyPair | null
  savedKey: SSHKey | null
  name: string
  privateKeyContent: string
  saving: boolean
  loading: boolean
  onSave: () => void
  onGenerate: () => void
  onExport: () => void
  onClose: () => void
}

export function KeygenFooter({
  isEditMode,
  isImportMode,
  generatedKey,
  savedKey,
  name,
  privateKeyContent,
  saving,
  loading,
  onSave,
  onGenerate,
  onExport,
  onClose
}: KeygenFooterProps) {
  return (
    <div className="p-4 border-t border-border bg-background">
      <div className="flex gap-2">
        {isEditMode ? (
          <>
            <Button className="flex-1" onClick={onSave} disabled={!name.trim() || saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
          </>
        ) : isImportMode ? (
          savedKey ? (
            <>
              <Button className="flex-1" onClick={onExport}>
                Export to Host
              </Button>
              <Button variant="outline" onClick={onClose}>
                Done
              </Button>
            </>
          ) : (
            <>
              <Button className="flex-1" onClick={onSave} disabled={!name.trim() || !privateKeyContent || saving}>
                {saving ? 'Importing...' : 'Import Key'}
              </Button>
              <Button variant="outline" onClick={onClose} disabled={saving}>
                Cancel
              </Button>
            </>
          )
        ) : !generatedKey ? (
          <>
            <Button className="flex-1" onClick={onGenerate} disabled={loading || !name.trim()}>
              {loading ? 'Generating...' : 'Generate'}
            </Button>
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
          </>
        ) : savedKey ? (
          <>
            <Button className="flex-1" onClick={onExport}>
              Export to Host
            </Button>
            <Button variant="outline" onClick={onClose}>
              Done
            </Button>
          </>
        ) : (
          <>
            <Button className="flex-1" onClick={onSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Key'}
            </Button>
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Close
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
