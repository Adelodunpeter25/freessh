import { Button } from '@/components/ui/button'
import { useKeygenContext } from '@/contexts/KeygenContext'

export function KeygenFooter() {
  const {
    isEditMode,
    isImportMode,
    generatedKey,
    savedKey,
    name,
    privateKeyContent,
    saving,
    loading,
    handleSave,
    handleGenerate,
    handleExport,
    handleClose
  } = useKeygenContext()

  return (
    <div className="p-4 border-t border-border bg-background">
      <div className="flex gap-2">
        {isEditMode ? (
          <>
            <Button className="flex-1" onClick={handleSave} disabled={!name.trim() || saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button variant="outline" onClick={handleClose} disabled={saving}>
              Cancel
            </Button>
          </>
        ) : isImportMode ? (
          savedKey ? (
            <>
              <Button className="flex-1" onClick={handleExport}>
                Export to Host
              </Button>
              <Button variant="outline" onClick={handleClose}>
                Done
              </Button>
            </>
          ) : (
            <>
              <Button className="flex-1" onClick={handleSave} disabled={!name.trim() || !privateKeyContent || saving}>
                {saving ? 'Importing...' : 'Import Key'}
              </Button>
              <Button variant="outline" onClick={handleClose} disabled={saving}>
                Cancel
              </Button>
            </>
          )
        ) : !generatedKey ? (
          <>
            <Button className="flex-1" onClick={handleGenerate} disabled={loading || !name.trim()}>
              {loading ? 'Generating...' : 'Generate'}
            </Button>
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
          </>
        ) : savedKey ? (
          <>
            <Button className="flex-1" onClick={handleExport}>
              Export to Host
            </Button>
            <Button variant="outline" onClick={handleClose}>
              Done
            </Button>
          </>
        ) : (
          <>
            <Button className="flex-1" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Key'}
            </Button>
            <Button variant="outline" onClick={handleClose} disabled={saving}>
              Close
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
