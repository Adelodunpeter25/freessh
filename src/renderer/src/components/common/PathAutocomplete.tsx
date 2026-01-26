import { useState, useEffect, useRef, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { FileInfo } from '@/types'
import { getParentPath, getBasename, filterSuggestions, buildFullPath } from '@/utils/pathAutocomplete'
import { Folder, File } from 'lucide-react'

interface PathAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onNavigate: (path: string, isFile: boolean) => void
  fetchSuggestions: (path: string) => Promise<FileInfo[]>
  currentPath?: string
  className?: string
  placeholder?: string
}

export function PathAutocomplete({
  value,
  onChange,
  onNavigate,
  fetchSuggestions,
  currentPath = '/',
  className,
  placeholder = 'Path...'
}: PathAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<FileInfo[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadSuggestions = async () => {
      if (!showSuggestions) {
        setSuggestions([])
        return
      }
      
      // If value is empty or relative, use currentPath as base
      const isAbsolutePath = value.startsWith('/')
      const parentPath = !value || !isAbsolutePath
        ? currentPath
        : value.endsWith('/') 
          ? value.slice(0, -1) || '/' 
          : getParentPath(value)
      
      const prefix = value.endsWith('/') ? '' : getBasename(value)
      
      try {
        const files = await fetchSuggestions(parentPath)
        setSuggestions(filterSuggestions(files, prefix))
      } catch {
        setSuggestions([])
      }
    }
    const timer = setTimeout(loadSuggestions, 150)
    return () => clearTimeout(timer)
  }, [value, showSuggestions, fetchSuggestions, currentPath])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectSuggestion = useCallback((file: FileInfo) => {
    const isAbsolutePath = value.startsWith('/')
    const parentPath = !value || !isAbsolutePath
      ? currentPath
      : value.endsWith('/')
        ? value.slice(0, -1) || '/'
        : getParentPath(value)
    
    const newPath = buildFullPath(parentPath, file.name)
    onChange(newPath)
    setShowSuggestions(false)
    setSelectedIndex(-1)
    if (file.is_dir) {
      onNavigate(newPath, false)
    } else {
      onNavigate(newPath, true)
    }
  }, [value, onChange, onNavigate, currentPath])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault()
        onNavigate(value, false)
      }
      return
    }

    if (e.key === 'Tab') {
      e.preventDefault()
      const targetIndex = selectedIndex >= 0 ? selectedIndex : 0
      selectSuggestion(suggestions[targetIndex])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => Math.max(i - 1, -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex >= 0) {
        selectSuggestion(suggestions[selectedIndex])
      } else {
        onNavigate(value, false)
        setShowSuggestions(false)
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }, [showSuggestions, suggestions, selectedIndex, value, onNavigate, selectSuggestion])

  return (
    <div ref={containerRef} className="relative flex-1">
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setShowSuggestions(true)
          setSelectedIndex(-1)
        }}
        onFocus={() => setShowSuggestions(true)}
        onKeyDown={handleKeyDown}
        className={className}
        placeholder={placeholder}
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-48 overflow-auto">
          {suggestions.map((file, i) => (
            <div
              key={file.path}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer hover:bg-accent ${i === selectedIndex ? 'bg-accent' : ''}`}
              onClick={() => selectSuggestion(file)}
            >
              {file.is_dir ? (
                <Folder className="w-4 h-4 text-primary shrink-0" />
              ) : (
                <File className="w-4 h-4 text-muted-foreground shrink-0" />
              )}
              <span className="truncate">{file.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
