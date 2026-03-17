import { useState } from 'react'
import type { Key } from '@/types'

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
  initialData?: Key
  onSubmit: (data: Key) => void
}

export function useKeyForm({ initialData, onSubmit }: UseKeyFormProps) {
  const [formData, setFormData] = useState<KeyFormData>({
    name: initialData?.name || '',
    type: (initialData?.type as 'rsa' | 'ed25519') || 'ed25519',
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
      const keyData: Key = {
        id: initialData?.id || `key-${Date.now()}`,
        name: formData.name.trim(),
        type: formData.type,
        bits: formData.bits,
        fingerprint: initialData?.fingerprint || '',
        public_key: initialData?.public_key || '',
        private_key: initialData?.private_key || '',
        created_at: initialData?.created_at || new Date().toISOString(),
      }

      await onSubmit(keyData)
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
