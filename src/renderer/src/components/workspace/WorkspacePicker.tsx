import { useMemo, useState } from 'react'
import { Search, FolderOpen, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { ConnectionConfig } from '@/types'

interface WorkspacePickerProps {
  connections: ConnectionConfig[]
  selectedIds: string[]
  onSelectionChange: (ids: string[]) => void
  onOpenWorkspace: () => void | Promise<void>
  opening?: boolean
}

export function WorkspacePicker({
  connections,
  selectedIds,
  onSelectionChange,
  onOpenWorkspace,
  opening = false,
}: WorkspacePickerProps) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return connections
    return connections.filter((conn) => {
      return (
        conn.name.toLowerCase().includes(q) ||
        conn.host.toLowerCase().includes(q) ||
        conn.username.toLowerCase().includes(q)
      )
    })
  }, [connections, query])

  const toggle = (id: string, additive: boolean) => {
    if (additive) {
      if (selectedIds.includes(id)) {
        onSelectionChange(selectedIds.filter((item) => item !== id))
      } else {
        onSelectionChange([...selectedIds, id])
      }
      return
    }

    if (selectedIds.length === 1 && selectedIds[0] === id) {
      onSelectionChange([])
      return
    }

    onSelectionChange([id])
  }

  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="w-full max-w-4xl rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="mx-auto mb-5 max-w-xl">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
              placeholder="Search connections"
              disabled={opening}
            />
          </div>
        </div>

        <div className="max-h-[420px] space-y-2 overflow-y-auto rounded-md border border-border p-2">
          {filtered.map((conn) => {
            const selected = selectedIds.includes(conn.id)
            return (
              <button
                key={conn.id}
                type="button"
                onClick={(e) => toggle(conn.id, e.metaKey || e.ctrlKey)}
                disabled={opening}
                className={[
                  'flex w-full items-center justify-between rounded-md border px-3 py-2 text-left transition-colors',
                  selected
                    ? 'border-primary/50 bg-primary/10'
                    : 'border-transparent hover:border-border hover:bg-muted/40',
                ].join(' ')}
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{conn.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {conn.username}@{conn.host}:{conn.port}
                  </span>
                </span>
              </button>
            )
          })}

          {filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">No connections found.</div>
          ) : null}
        </div>

        <div className="mt-5 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Use Cmd/Ctrl + click to select multiple connections.</p>
          <Button onClick={onOpenWorkspace} disabled={selectedIds.length === 0 || opening}>
            {opening ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FolderOpen className="mr-2 h-4 w-4" />}
            Open Workspace
          </Button>
        </div>
      </div>
    </div>
  )
}
