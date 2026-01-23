import { Copy, Clipboard, MousePointer, Trash2, Search, SplitSquareHorizontal } from 'lucide-react'
import { BaseContextMenu, ContextMenuAction } from './BaseContextMenu'

interface TerminalContextMenuProps {
  children: React.ReactNode
  onCopy: () => void
  onPaste: () => void
  onSelectAll: () => void
  onClear: () => void
  onFind: () => void
  onSplit: () => void
}

export function TerminalContextMenu({
  children,
  onCopy,
  onPaste,
  onSelectAll,
  onClear,
  onFind,
  onSplit
}: TerminalContextMenuProps) {
  const actions: ContextMenuAction[] = [
    {
      label: 'Copy',
      icon: <Copy className="w-4 h-4" />,
      onClick: onCopy
    },
    {
      label: 'Paste',
      icon: <Clipboard className="w-4 h-4" />,
      onClick: onPaste
    },
    {
      label: 'Select All',
      icon: <MousePointer className="w-4 h-4" />,
      onClick: onSelectAll,
      separator: true
    },
    {
      label: 'Find in Terminal',
      icon: <Search className="w-4 h-4" />,
      onClick: onFind
    },
    {
      label: 'Split Terminal',
      icon: <SplitSquareHorizontal className="w-4 h-4" />,
      onClick: onSplit,
      separator: true
    },
    {
      label: 'Clear Terminal',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: onClear,
      destructive: true
    }
  ]

  return <BaseContextMenu actions={actions}>{children}</BaseContextMenu>
}
