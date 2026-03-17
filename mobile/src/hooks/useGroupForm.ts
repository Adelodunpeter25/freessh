import { useState } from 'react'
import type { Group } from '@/types'

export type GroupFormData = {
  name: string
}

export type GroupFormErrors = {
  name?: string
}

type UseGroupFormProps = {
  initialData?: Group
  onSubmit: (data: Group) => void
}

export function useGroupForm({ initialData, onSubmit }: UseGroupFormProps) {
  const [formData, setFormData] = useState<GroupFormData>({
    name: initialData?.name || '',
  })

  const [errors, setErrors] = useState<GroupFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: GroupFormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const updateField = (field: keyof GroupFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field as keyof GroupFormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      const groupData: Group = {
        id: initialData?.id || `grp-${Date.now()}`,
        name: formData.name.trim(),
        connection_count: initialData?.connection_count || 0,
        created_at: initialData?.created_at || new Date().toISOString(),
      }

      await onSubmit(groupData)
    } finally {
      setIsSubmitting(false)
    }
  }

  const reset = () => {
    setFormData({
      name: '',
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
