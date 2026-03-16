import { useCallback, useMemo, useState } from 'react'

type UseSearchOptions<T> = {
  items: T[]
  fields: (keyof T)[]
}

export function useSearch<T extends Record<string, unknown>>(
  options: UseSearchOptions<T>
) {
  const { items, fields } = options
  const [query, setQuery] = useState('')

  const normalizedQuery = useMemo(() => query.trim().toLowerCase(), [query])

  const filtered = useMemo(() => {
    if (!normalizedQuery) return items
    return items.filter((item) =>
      fields.some((field) => {
        const value = item[field]
        if (value == null) return false
        return String(value).toLowerCase().includes(normalizedQuery)
      })
    )
  }, [fields, items, normalizedQuery])

  const onChangeQuery = useCallback((value: string) => {
    setQuery(value)
  }, [])

  const clearQuery = useCallback(() => {
    setQuery('')
  }, [])

  return {
    query,
    filtered,
    setQuery: onChangeQuery,
    clearQuery,
    isEmpty: filtered.length === 0,
  }
}
