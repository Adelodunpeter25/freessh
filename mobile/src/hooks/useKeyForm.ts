import { useState } from 'react'
import type { SSHKey } from '@/types'
import { keyGenerator } from '@/services'

export type KeyFormData = {
  name: string
  type: 'rsa' | 'ed25519'
  bits?: number
  passphrase?: string
}

export type KeyFormErrors = {
  name?: string
  passphrase?: string
}

type UseKeyFormProps = {
  initialData?: SSHKey
  onSubmit: (data: SSHKey & { private_key?: string, passphrase?: string }) => void
}

export function useKeyForm({ initialData, onSubmit }: UseKeyFormProps) {
  const [formData, setFormData] = useState<KeyFormData>({
    name: initialData?.name || '',
    type: (initialData?.algorithm as 'rsa' | 'ed25519') || 'ed25519',
    bits: initialData?.bits || 2048,
    passphrase: '',
  })

  const [errors, setErrors] = useState<KeyFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: KeyFormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const updateField = (field: keyof KeyFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field as keyof KeyFormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      let keyResult;
      
      // If we are creating a new key, we generate it
      if (!initialData) {
        if (formData.type === 'ed25519') {
          keyResult = await keyGenerator.generateEd25519(formData.name.trim())
        } else {
          keyResult = await keyGenerator.generateRSA(formData.name.trim(), formData.bits)
        }
        
        await onSubmit({
           ...keyResult.key,
           private_key: keyResult.privateKey,
           passphrase: formData.passphrase || undefined
        })
      } else {
        // Updating existing (only metadata usually)
        await onSubmit({
           ...initialData,
           name: formData.name.trim(),
           algorithm: formData.type,
           bits: formData.type === 'rsa' ? formData.bits : undefined,
           passphrase: formData.passphrase || undefined
        })
      }
    } catch (error) {
      console.error('Failed to generate key:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const reset = () => {
    setFormData({
      name: '',
      type: 'ed25519',
      bits: 2048,
      passphrase: '',
    })
    setErrors({})
  }

  return {
    formData,
    errors,
    isSubmitting,
    updateField,
    handleSubmit,
    reset,
    isValid: Object.keys(errors).length === 0,
  }
}
