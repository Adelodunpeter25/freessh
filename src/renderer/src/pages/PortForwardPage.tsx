import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TunnelList, PortForwardSidebar } from '@/components/portforward'
import { usePortForward } from '@/hooks/usePortForward'
import { toast } from 'sonner'

interface PortForwardPageProps {
  sessionId: string | null
}

export function PortForwardPage({ sessionId }: PortForwardPageProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { tunnels, loading, createLocalTunnel, createRemoteTunnel, stopTunnel } = usePortForward(sessionId)

  const handleCreateLocal = async (config: { localPort: number; remoteHost: string; remotePort: number }) => {
    try {
      await createLocalTunnel({
        local_port: config.localPort,
        remote_host: config.remoteHost,
        remote_port: config.remotePort
      })
      toast.success('Local tunnel created')
      setSidebarOpen(false)
    } catch (error) {
      toast.error('Failed to create tunnel')
    }
  }

  const handleCreateRemote = async (config: { remotePort: number; localHost: string; localPort: number }) => {
    try {
      await createRemoteTunnel({
        remote_port: config.remotePort,
        local_host: config.localHost,
        local_port: config.localPort
      })
      toast.success('Remote tunnel created')
      setSidebarOpen(false)
    } catch (error) {
      toast.error('Failed to create tunnel')
    }
  }

  const handleStop = async (id: string) => {
    try {
      await stopTunnel(id)
      toast.success('Tunnel stopped')
    } catch (error) {
      toast.error('Failed to stop tunnel')
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Port Forwarding</h2>
          <p className="text-sm text-muted-foreground">
            Manage SSH port forwarding tunnels
          </p>
        </div>
        <Button onClick={() => setSidebarOpen(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New Tunnel
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <TunnelList tunnels={tunnels} loading={loading} onStop={handleStop} />
      </div>

      <PortForwardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onCreateLocal={handleCreateLocal}
        onCreateRemote={handleCreateRemote}
      />
    </div>
  )
}
