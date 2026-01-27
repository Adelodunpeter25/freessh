import { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react'
import { useKeygen } from '@/hooks/useKeygen'
import { KeyType, GeneratedKeyPair } from '@/types/keygen'
import { SSHKey } from '@/types/key'
import { toast } from 'sonner'

interface KeygenContextValue {
  keyType: KeyType
  setKeyType: (type: KeyType) => void
  keySize: number
  setKeySize: (size: number) => void
  name: string
  setName: (name: string) => void
  privateKeyContent: string
  setPrivateKeyContent: (content: string) => void
  passphrase: string
  setPassphrase: (passphrase: string) => void
  saving: boolean
  savedKey: SSHKey | null
  loading: boolean
  generatedKey: GeneratedKeyPair | null
  isEditMode: boolean
  isImportMode: boolean
  handleGenerate: () => Promise<void>
  handleSave: () => Promise<void>
  handleSelectFile: () => Promise<void>
  handleExport: () => void
  handleClose: () => void
  copyToClipboard: (text: string, label: string) => void
}

const KeygenContext = createContext<KeygenContextValue | undefined>(undefined)

interface KeygenProviderProps {
  children: ReactNode
  editKey?: SSHKey
  importMode?: boolean
  onClose: () => void
  onKeyGenerated?: (key: SSHKey, privateKey: string) => Promise<SSHKey>
  onKeyImported?: (name: string, privateKey: string, passphrase?: string) => Promise<SSHKey>
  onKeyUpdated?: (key: SSHKey) => Promise<void>
  onExportKey?: (key: SSHKey) => void
}

export function KeygenProvider({
  children,
  editKey,
  importMode,
  onClose,
  onKeyGenerated,
  onKeyImported,
  onKeyUpdated,
  onExportKey
}: KeygenProviderProps) {
  const [keyType, setKeyType] = useState<KeyType>(editKey?.algorithm as KeyType || 'rsa')
  const [keySize, setKeySize] = useState(editKey?.bits || 4096)
  const [name, setName] = useState(editKey?.name || '')
  const [privateKeyContent, setPrivateKeyContent] = useState('')
  const [passphrase, setPassphrase] = useState('')
  const [saving, setSaving] = useState(false)
  const [savedKey, setSavedKey] = useState<SSHKey | null>(null)
  const { loading, generatedKey, generateKey, clearGeneratedKey } = useKeygen()

  const isEditMode = !!editKey
  const isImportMode = !!importMode

  const handleGenerate = useCallback(async () => {
    await generateKey({
      key_type: keyType,
      key_size: keyType === 'rsa' ? keySize : undefined
    })
  }, [keyType, keySize, generateKey])

  const handleClose = useCallback(() => {
    clearGeneratedKey()
    setName('')
    setSavedKey(null)
    onClose()
  }, [clearGeneratedKey, onClose])

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      if (isEditMode && onKeyUpdated && name.trim()) {
        await onKeyUpdated({
          ...editKey,
          name: name.trim()
        })
        handleClose()
      } else if (isImportMode && onKeyImported && name.trim() && privateKeyContent) {
        const saved = await onKeyImported(name.trim(), privateKeyContent, passphrase || undefined)
        setSavedKey(saved)
        handleClose()
      } else if (generatedKey && onKeyGenerated && name.trim()) {
        const keyData = {
          id: '',
          name: name.trim(),
          algorithm: keyType,
          bits: keyType === 'rsa' ? keySize : undefined,
          publicKey: generatedKey.public_key
        }
        
        const saved = await onKeyGenerated(keyData as any, generatedKey.private_key)
        setSavedKey(saved)
      }
    } catch (error) {
      console.error('[KeygenProvider] Save failed:', error)
      throw error
    } finally {
      setSaving(false)
    }
  }, [isEditMode, isImportMode, name, privateKeyContent, passphrase, generatedKey, keyType, keySize, editKey, onKeyUpdated, onKeyImported, onKeyGenerated, handleClose])

  const handleSelectFile = useCallback(async () => {
    try {
      const result = await window.electron.ipcRenderer.invoke('dialog:openFile')
      if (result && result.content) {
        setPrivateKeyContent(result.content)
      }
    } catch (error) {
      console.error('Failed to open file:', error)
    }
  }, [])

  const handleExport = useCallback(() => {
    if (savedKey && onExportKey) {
      onExportKey(savedKey)
    }
  }, [savedKey, onExportKey])

  const copyToClipboard = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard`)
  }, [])

  const value = useMemo(() => ({
    keyType,
    setKeyType,
    keySize,
    setKeySize,
    name,
    setName,
    privateKeyContent,
    setPrivateKeyContent,
    passphrase,
    setPassphrase,
    saving,
    savedKey,
    loading,
    generatedKey,
    isEditMode,
    isImportMode,
    handleGenerate,
    handleSave,
    handleSelectFile,
    handleExport,
    handleClose,
    copyToClipboard
  }), [
    keyType,
    keySize,
    name,
    privateKeyContent,
    passphrase,
    saving,
    savedKey,
    loading,
    generatedKey,
    isEditMode,
    isImportMode,
    handleGenerate,
    handleSave,
    handleSelectFile,
    handleExport,
    handleClose,
    copyToClipboard
  ])

  return (
    <KeygenContext.Provider value={value}>
      {children}
    </KeygenContext.Provider>
  )
}

export function useKeygenContext() {
  const context = useContext(KeygenContext)
  if (!context) {
    throw new Error('useKeygenContext must be used within KeygenProvider')
  }
  return context
}
