import { PanelRight } from 'lucide-react'
import { SessionTabBar } from './SessionTabBar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface TitleBarProps {
  showHome: boolean
  showSFTP: boolean
  showTerminal: boolean
  sidebarOpen: boolean
  onHomeClick: () => void
  onSFTPClick: () => void
  onSessionClick: () => void
  onSidebarToggle: () => void
}

const noDrag = { WebkitAppRegion: 'no-drag' } as React.CSSProperties

export function TitleBar({ showHome, showSFTP, showTerminal, sidebarOpen, onHomeClick, onSFTPClick, onSessionClick, onSidebarToggle }: TitleBarProps) {
  return (
    <div className="h-14 bg-background border-b border-border flex items-center px-4 select-none" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
      <div className="flex items-center gap-3 pl-16">
        <span className="text-sm font-semibold text-foreground">FreeSSH</span>
      </div>
      
      <div className="flex-1 flex items-center ml-4">
        <SessionTabBar showHome={showHome} showSFTP={showSFTP} onHomeClick={onHomeClick} onSFTPClick={onSFTPClick} onSessionClick={onSessionClick} />
      </div>

      {showTerminal && (
        <Button 
          variant="ghost" 
          size="icon" 
          style={noDrag} 
          onClick={onSidebarToggle}
          className={cn(sidebarOpen && "bg-accent")}
        >
          <PanelRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
