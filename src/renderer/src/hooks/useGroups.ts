import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { groupService } from '@/services/ipc'
import { Group } from '@/types'

export function useGroups() {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(false)

  const loadGroups = useCallback(async () => {
    setLoading(true)
    try {
      const data = await groupService.list()
      setGroups(data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load groups')
    } finally {
      setLoading(false)
    }
  }, [])

  const createGroup = useCallback(async (name: string) => {
    try {
      const newGroup = await groupService.create(name)
      setGroups(prev => [...prev, newGroup])
      toast.success(`Group "${name}" created`)
      return newGroup
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create group')
      throw error
    }
  }, [])

  const renameGroup = useCallback(async (id: string, newName: string) => {
    try {
      await groupService.rename(id, newName)
      setGroups(prev => prev.map(g => g.id === id ? { ...g, name: newName } : g))
      toast.success(`Group renamed to "${newName}"`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to rename group')
      throw error
    }
  }, [])

  const deleteGroup = useCallback(async (id: string) => {
    try {
      await groupService.delete(id)
      setGroups(prev => prev.filter(g => g.id !== id))
      toast.success('Group deleted')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete group')
      throw error
    }
  }, [])

  useEffect(() => {
    loadGroups()
  }, [loadGroups])

  return {
    groups,
    loading,
    createGroup,
    renameGroup,
    deleteGroup,
    refresh: loadGroups
  }
}
