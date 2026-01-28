import { useState } from 'react'
import { Server, Key, Fingerprint, ArrowRightLeft, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type SidebarTab = 'connections' | 'keys' | 'known-hosts' | 'port-forward'

interface SidebarProps {
  onTabChange?: (tab: SidebarTab) => void
}

export function Sidebar({ onTabChange }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<SidebarTab>('connections')

  const mainTabs = [
    { id: 'connections' as SidebarTab, icon: Server, label: 'Connections' },
    { id: 'keys' as SidebarTab, icon: Key, label: 'Keys' },
    { id: 'known-hosts' as SidebarTab, icon: Fingerprint, label: 'Known Hosts' },
    { id: 'port-forward' as SidebarTab, icon: ArrowRightLeft, label: 'Port Forward' },
  ]

  const handleTabClick = (tabId: SidebarTab) => {
    setActiveTab(tabId)
    onTabChange?.(tabId)
  }

  const SidebarItem = ({ id, icon: Icon, label }: { id: SidebarTab; icon: LucideIcon; label: string }) => (
    <button
      onClick={() => handleTabClick(id)}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg group relative',
        activeTab === id
          ? 'text-primary bg-primary/10 shadow-sm'
          : 'text-foreground/70 dark:text-foreground/80 hover:text-foreground hover:bg-muted/50'
      )}
    >
      <Icon className={cn("h-4 w-4 flex-shrink-0 transition-colors", activeTab === id ? "text-primary" : "group-hover:text-foreground")} />
      <span className="truncate">{label}</span>
      {activeTab === id && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-3/5 bg-primary rounded-l-full opacity-0" />
      )}
    </button>
  )

  return (
    <div className="h-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-r border-border flex flex-col p-3 gap-6">
      
      <div className="space-y-1">
        <div className="px-3 py-2 text-sm font-semibold text-muted-foreground tracking-wide mb-2">
          Freessh
        </div>
        {mainTabs.map((tab) => (
          <SidebarItem key={tab.id} {...tab} />
        ))}
      </div>
    </div>
  )
}
