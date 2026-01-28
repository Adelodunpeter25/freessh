import { Pencil, Trash2 } from 'lucide-react'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger
} from '@/components/ui/context-menu'
import { PortForwardConfig } from '@/types'

interface TunnelCardContextMenuProps {
  config: PortForwardConfig
  onEdit: (config: PortForwardConfig) => void
  onDelete: (id: string) => void
  children: React.ReactNode
}

export function TunnelCardContextMenu({ config, onEdit, onDelete, children }: TunnelCardContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => onEdit(config)}>
          <Pencil className="w-4 h-4 mr-2" />
          Edit
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem 
          onClick={() => onDelete(config.id)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
