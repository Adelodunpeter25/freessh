import { KnownHostsList } from '@/components/knownhosts'

export function KnownHostsPage() {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Known Hosts</h2>
        <p className="text-sm text-muted-foreground">
          Manage trusted SSH host fingerprints
        </p>
      </div>
      <KnownHostsList />
    </div>
  )
}
