import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ThemeSettings } from './ThemeSettings'
import { LogSettings } from './LogSettings'

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [activeTab, setActiveTab] = useState<'theme' | 'logs'>('theme')

  useEffect(() => {
    if (!open) {
      setActiveTab('theme')
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'theme' | 'logs')} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="theme">Theme</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="theme" className="mt-6">
            <ThemeSettings />
          </TabsContent>
          
          <TabsContent value="logs" className="mt-6">
            {activeTab === 'logs' ? <LogSettings /> : null}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
