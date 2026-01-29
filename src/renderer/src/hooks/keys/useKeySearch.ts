import { useState, useMemo } from 'react'
import { SSHKey } from '@/types/key'

export function useKeySearch(keys: SSHKey[]) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredKeys = useMemo(() => {
    if (!searchQuery.trim()) return keys

    const query = searchQuery.toLowerCase()
    return keys.filter(key => 
      key.name.toLowerCase().includes(query) ||
      key.algorithm.toLowerCase().includes(query) ||
      (key.bits && key.bits.toString().includes(query))
    )
  }, [keys, searchQuery])

  const isSearching = searchQuery.trim().length > 0

  return {
    searchQuery,
    setSearchQuery,
    filteredKeys,
    isSearching
  }
}
