import type { WorkspaceShellProps } from './types'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'

export function WorkspaceShell({ title = 'Workspace', sidebar, content, footer }: WorkspaceShellProps) {
  return (
    <section className="flex h-full w-full flex-col bg-background">
      <header className="flex h-12 items-center border-b border-border px-4">
        <h2 className="text-sm font-semibold tracking-wide text-foreground">{title}</h2>
      </header>

      {sidebar ? (
        <ResizablePanelGroup direction="horizontal" autoSaveId="workspace-shell-layout">
          <ResizablePanel defaultSize={24} minSize={14} maxSize={40}>
            <aside className="h-full border-r border-border bg-muted/20">{sidebar}</aside>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={76}>
            <main className="min-h-0 h-full">{content}</main>
          </ResizablePanel>
        </ResizablePanelGroup>
      ) : (
        <div className="min-h-0 flex-1">
          <main className="min-h-0 h-full">{content}</main>
        </div>
      )}

      {footer ? <footer className="border-t border-border px-4 py-2">{footer}</footer> : null}
    </section>
  )
}
