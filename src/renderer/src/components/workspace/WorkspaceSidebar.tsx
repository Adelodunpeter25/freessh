import type { WorkspaceSidebarProps } from './types'
import { WorkspaceTabListItem } from './WorkspaceTabListItem'

export function WorkspaceSidebar({ tabs, activeTabId, onSelectTab }: WorkspaceSidebarProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-3 py-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sessions</h3>
      </div>
      <div className="flex-1 space-y-1 overflow-y-auto p-2">
        {tabs.map((tab) => (
          <WorkspaceTabListItem
            key={tab.tab_id}
            tab={tab}
            active={activeTabId === tab.tab_id}
            onSelect={onSelectTab}
          />
        ))}
      </div>
    </div>
  )
}
