import { useState } from 'react'
import { KnownHostsHeader } from '@/components/knownhosts/KnownHostsHeader'
import { KnownHostsList } from '@/components/knownhosts'
import { useKnownHosts } from '@/hooks/useKnownHosts'

export function KnownHostsPage() {
  const { importFromSSH } = useKnownHosts()
  const [importing, setImporting] = useState(false)

  const handleImport = async () => {
    setImporting(true)
    try {
      await importFromSSH()
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <KnownHostsHeader onImport={handleImport} importing={importing} />
      </div>
      <KnownHostsList />
    </div>
  )
}
