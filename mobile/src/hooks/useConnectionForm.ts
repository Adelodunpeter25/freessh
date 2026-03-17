import { useState } from 'react'
import type { ConnectionConfig, AuthMethod } from '@/types'

export type ConnectionFormData = {
  name: string
  host: string
  port: string
  username: string
  auth_method: AuthMethod
  private_key?: string
  key_id?: string
  group?: string
}

export type ConnectionFormErrors = {
  name?: string
  host?: string
  port?: string
  username?: string
}

type UseConnectionFormProps = {
  initialData?: ConnectionConfig
  onSubmit: (data: ConnectionConfig) => void
}

export function useConnectionForm({ initialData, onSubmit }: UseConnectionFormProps) {
  const [formData, setFormData] = useState<ConnectionFormData>({
    name: initialData?.name || '',
    host: initialData?.host || '',
    port: initialData?.port?.toString() || '22',
    username: initialData?.username || '',
    auth_method: initialData?.auth_method || 'password',
    private_key: initialData?.private_key || '',
    key_id: initialData?.key_id || '',
    group: initialData?.group || '',
  })

  const [errors, setErrors] = useState<ConnectionFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: ConnectionFormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.host.trim()) {
      newErrors.host = 'Host is required'
    }

    if (!formData.port.trim()) {
      newErrors.port = 'Port is required'
    } else {
      const port = parseInt(formData.port)
      if (isNaN(port) || port < 1 || port > 65535) {
        newErrors.port = 'Port must be between 1 and 65535'
      }
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const updateField = (field: keyof ConnectionFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field as keyof ConnectionFormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      const connectionData: ConnectionConfig = {
        id: initialData?.id || `conn-${Date.now()}`,
        name: formData.name.trim(),
        host: formData.host.trim(),
        port: parseInt(formData.port),
        username: formData.username.trim(),
        auth_method: formData.auth_method,
        private_key: formData.private_key || undefined,
        key_id: formData.key_id || undefined,
        group: formData.group || undefined,
      }

      await onSubmit(connectionData)
    } finally {
      setIsSubmitting(false)
    }
  }

  const reset = () => {
    setFormData({
      name: '',
      host: '',
      port: '22',
      username: '',
      auth_method: 'password',
      private_key: '',
      key_id: '',
      group: '',
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
