import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'

interface SessionTabInputProps {
  value: string
  onSave: (value: string) => void
  onCancel: () => void
}

export function SessionTabInput({ value, onSave, onCancel }: SessionTabInputProps) {
  const [inputValue, setInputValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (inputValue.trim()) {
        onSave(inputValue.trim())
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onCancel()
    }
  }

  const handleBlur = () => {
    if (inputValue.trim() && inputValue !== value) {
      onSave(inputValue.trim())
    } else {
      onCancel()
    }
  }

  return (
    <Input
      ref={inputRef}
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      className="h-7 px-2 text-sm max-w-[180px]"
      onClick={(e) => e.stopPropagation()}
    />
  )
}
