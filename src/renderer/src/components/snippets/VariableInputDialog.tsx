import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface VariableInputDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  variables: string[]
  onConfirm: (values: Record<string, string>) => void
}

export function VariableInputDialog({ open, onOpenChange, variables, onConfirm }: VariableInputDialogProps) {
  const [values, setValues] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      const initialValues: Record<string, string> = {}
      variables.forEach(v => initialValues[v] = '')
      setValues(initialValues)
    }
  }, [open, variables])

  const handleConfirm = () => {
    const allFilled = variables.every(v => values[v]?.trim())
    if (!allFilled) return
    
    onConfirm(values)
    onOpenChange(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent, isLast: boolean) => {
    if (e.key === 'Enter' && isLast) {
      handleConfirm()
    }
  }

  const allFilled = variables.every(v => values[v]?.trim())

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enter Variable Values</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {variables.map((variable, index) => (
            <div key={variable} className="space-y-2">
              <Label htmlFor={variable}>{variable}</Label>
              <Input
                id={variable}
                autoFocus={index === 0}
                placeholder={`Enter ${variable.toLowerCase()}`}
                value={values[variable] || ''}
                onChange={(e) => setValues(prev => ({ ...prev, [variable]: e.target.value }))}
                onKeyDown={(e) => handleKeyDown(e, index === variables.length - 1)}
              />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!allFilled}>
            Run Command
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
