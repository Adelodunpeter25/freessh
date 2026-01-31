import { useState, useCallback } from 'react'

export const useMultiSelect = () => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null)

  const handleSelect = useCallback((items: { name: string }[], item: { name: string }, index: number, event: React.MouseEvent) => {
    const itemName = item.name

    if (event.shiftKey && lastSelectedIndex !== null) {
      // Range selection - replace current selection with range
      const start = Math.min(lastSelectedIndex, index)
      const end = Math.max(lastSelectedIndex, index)
      const rangeItems = items.slice(start, end + 1).map(i => i.name)
      
      setSelectedItems(new Set(rangeItems))
      // Don't update lastSelectedIndex on shift - keep the anchor point
    } else if (event.metaKey || event.ctrlKey) {
      // Toggle selection
      setSelectedItems(prev => {
        const next = new Set(prev)
        if (next.has(itemName)) {
          next.delete(itemName)
        } else {
          next.add(itemName)
        }
        return next
      })
      setLastSelectedIndex(index)
    } else {
      // Single selection - clear others
      setSelectedItems(new Set([itemName]))
      setLastSelectedIndex(index)
    }
  }, [lastSelectedIndex])

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set())
    setLastSelectedIndex(null)
  }, [])

  const isSelected = useCallback((itemName: string) => {
    return selectedItems.has(itemName)
  }, [selectedItems])

  return {
    selectedItems,
    handleSelect,
    clearSelection,
    isSelected
  }
}
