import { useState, useCallback } from 'react'
import { Group } from '@/types'
import { useGroups } from '@/hooks'

export function useGroupHandlers() {
  const { groups, loading, createGroup, renameGroup, deleteGroup } = useGroups()
  const [showGroupSidebar, setShowGroupSidebar] = useState(false)
  const [editingGroup, setEditingGroup] = useState<Group | undefined>()
  const [groupToDelete, setGroupToDelete] = useState<{ id: string; name: string } | null>(null)
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [openedGroup, setOpenedGroup] = useState<Group | null>(null)

  const handleSelectGroup = useCallback((group: Group | null) => {
    setSelectedGroupId(group?.id ?? null)
    setSelectedGroup(group?.name ?? null)
  }, [])

  const handleEditGroup = useCallback((group: Group) => {
    setEditingGroup(group)
    setShowGroupSidebar(true)
  }, [])

  const handleDeleteGroup = useCallback((id: string) => {
    const group = groups.find(g => g.id === id)
    if (group) {
      setGroupToDelete({ id: group.id, name: group.name })
    }
  }, [groups])

  const handleConfirmDeleteGroup = useCallback(async () => {
    if (groupToDelete) {
      await deleteGroup(groupToDelete.id)
      if (selectedGroupId === groupToDelete.id) {
        setSelectedGroupId(null)
        setSelectedGroup(null)
      }
      setGroupToDelete(null)
    }
  }, [groupToDelete, deleteGroup, selectedGroupId])

  const handleNewGroup = useCallback(() => {
    setEditingGroup(undefined)
    setShowGroupSidebar(true)
  }, [])

  const handleSaveGroup = useCallback(async (name: string) => {
    if (editingGroup) {
      await renameGroup(editingGroup.id, name)
    } else {
      await createGroup(name)
    }
  }, [editingGroup, renameGroup, createGroup])

  const handleCloseGroupSidebar = useCallback(() => {
    setShowGroupSidebar(false)
    setEditingGroup(undefined)
  }, [])

  const handleCancelDeleteGroup = useCallback(() => {
    setGroupToDelete(null)
  }, [])

  const handleOpenGroup = useCallback((group: Group) => {
    setOpenedGroup(group)
  }, [])

  const handleCloseGroupDetail = useCallback(() => {
    setOpenedGroup(null)
  }, [])

  return {
    groups,
    loading,
    selectedGroupId,
    selectedGroup,
    showGroupSidebar,
    editingGroup,
    groupToDelete,
    openedGroup,
    handleSelectGroup,
    handleEditGroup,
    handleDeleteGroup,
    handleConfirmDeleteGroup,
    handleNewGroup,
    handleSaveGroup,
    handleCloseGroupSidebar,
    handleCancelDeleteGroup,
    handleOpenGroup,
    handleCloseGroupDetail,
  }
}
