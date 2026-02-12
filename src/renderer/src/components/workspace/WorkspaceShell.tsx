import type { WorkspaceShellProps } from './types'

export function WorkspaceShell({ title = 'Workspace', sidebar, content, footer }: WorkspaceShellProps) {
  return (
    <section className="flex h-full w-full flex-col bg-background">
      <header className="flex h-12 items-center border-b border-border px-4">
        <h2 className="text-sm font-semibold tracking-wide text-foreground">{title}</h2>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="w-72 shrink-0 border-r border-border bg-muted/20">{sidebar}</aside>
        <main className="min-h-0 flex-1">{content}</main>
      </div>

      {footer ? <footer className="border-t border-border px-4 py-2">{footer}</footer> : null}
    </section>
  )
}
