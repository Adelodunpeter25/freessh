import { useState, useMemo } from 'react'
import { FileInfo } from '@/types'

export function useSearch(files: FileInfo[]) {
  const [query, setQuery] = useState('')

  const filteredFiles = useMemo(() => {
    if (!query.trim()) return files

    const lowerQuery = query.toLowerCase()
    return files.filter(file => 
      file.name.toLowerCase().includes(lowerQuery)
    )
  }, [files, query])

  const clearSearch = () => setQuery('')

  return {
    query,
    setQuery,
    filteredFiles,
    clearSearch,
    isSearching: query.trim().length > 0
  }
}
