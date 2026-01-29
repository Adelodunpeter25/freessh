import { useState, useEffect } from 'react'

export function useFormDirty<T>(initialData: T, currentData: T): boolean {
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    const dirty = JSON.stringify(initialData) !== JSON.stringify(currentData)
    setIsDirty(dirty)
  }, [initialData, currentData])

  return isDirty
}
