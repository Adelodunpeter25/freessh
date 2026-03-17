import { useState } from 'react'
import type { Snippet } from '@/types'

export type SnippetFormData = {
  name: string
  command: string
}

export type SnippetFormErrors = {
  name?: string
  command?: string
}

type UseSnippetFormProps = {
  initialData?: Snippet
  onSubmit: (data: Snippet) => void
}

export function useSnippetForm({ initialData, onSubmit }: UseSnippetFormProps) {
  const [formData, setFormData] = useState<SnippetFormData>({
    name: initialData?.name || '',
    command: initialData?.command || '',
  })

  const [errors, setErrors] = useState<SnippetFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: SnippetFormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.command.trim()) {
      newErrors.command = 'Command is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const updateField = (field: keyof SnippetFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field as keyof SnippetFormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      const snippetData: Snippet = {
        id: initialData?.id || `snip-${Date.now()}`,
        name: formData.name.trim(),
        command: formData.command.trim(),
        created_at: initialData?.created_at || new Date().toISOString(),
      }

      await onSubmit(snippetData)
    } finally {
      setIsSubmitting(false)
    }
  }

  const reset = () => {
    setFormData({
      name: '',
      command: '',
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
