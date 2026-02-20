import { useState } from 'react'
import type { WorkspaceSidebarProps } from './types'
import { WorkspaceTabListItem } from './WorkspaceTabListItem'

export function WorkspaceSidebar({ tabs, activeTabId, onSelectTab, onDropSession }: WorkspaceSidebarProps) {
  const [dropActive, setDropActive] = useState(false)

  const handleDragOver = (event: React.DragEvent) => {
    const hasData = event.dataTransfer.types.includes('application/x-freessh-session')
    if (!hasData) return
    event.preventDefault()
    setDropActive(true)
  }

  const handleDragLeave = () => {
    setDropActive(false)
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setDropActive(false)

    if (!onDropSession) return
    const payload = event.dataTransfer.getData('application/x-freessh-session')
    if (!payload) return

    try {
      const data = JSON.parse(payload) as { sessionId?: string }
      if (data.sessionId) {
        onDropSession(data.sessionId)
      }
    } catch {
      // Ignore malformed drops.
    }
  }

  return (
    <div
      className={`flex h-full flex-col transition-colors ${dropActive ? 'bg-primary/5' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="border-b border-border px-3 py-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sessions</h3>
      </div>
      <div className="flex-1 space-y-1 overflow-y-auto p-2">
        {tabs.map((tab) => (
          <WorkspaceTabListItem
            key={tab.sessionId}
            tab={tab}
            active={activeTabId === tab.sessionId}
            onSelect={onSelectTab}
          />
        ))}
      </div>
    </div>
  )
}
