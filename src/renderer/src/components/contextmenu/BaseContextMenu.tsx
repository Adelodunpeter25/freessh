import { ReactNode } from 'react'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'

export interface ContextMenuAction {
  label: string
  icon?: ReactNode
  onClick: () => void
  destructive?: boolean
  disabled?: boolean
  separator?: boolean
}

interface BaseContextMenuProps {
  children: React.ReactNode
  actions: ContextMenuAction[]
}

export function BaseContextMenu({ children, actions }: BaseContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        {actions.map((action, index) => (
          <div key={index}>
            {action.separator && index > 0 && <ContextMenuSeparator />}
            <ContextMenuItem
              onClick={action.onClick}
              disabled={action.disabled}
              className={action.destructive ? 'text-destructive focus:text-destructive' : ''}
            >
              {action.icon}
              {action.label}
            </ContextMenuItem>
          </div>
        ))}
      </ContextMenuContent>
    </ContextMenu>
  )
}

export { ContextMenuSeparator }
