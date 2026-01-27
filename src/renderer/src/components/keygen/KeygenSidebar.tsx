import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { SSHKey } from '@/types/key'
import { KeygenProvider, useKeygenContext } from '@/contexts/KeygenContext'
import { KeygenForm } from './KeygenForm'
import { KeygenFooter } from './KeygenFooter'

interface KeygenSidebarProps {
  onClose: () => void
  onKeyGenerated?: (key: SSHKey, privateKey: string) => Promise<SSHKey>
  onKeyImported?: (name: string, privateKey: string, passphrase?: string) => Promise<SSHKey>
  onKeyUpdated?: (key: SSHKey) => Promise<void>
  onExportKey?: (key: SSHKey) => void
  editKey?: SSHKey
  importMode?: boolean
}

function KeygenSidebarContent() {
  const { isEditMode, isImportMode, handleClose } = useKeygenContext()

  return (
    <div className="fixed right-0 top-12 bottom-0 w-80 bg-background border-l border-border shadow-lg z-50 flex flex-col animate-fade-in">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-semibold">
          {isEditMode ? 'Edit SSH Key' : isImportMode ? 'Import SSH Key' : 'Generate SSH Key'}
        </h2>
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Close</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <KeygenForm />
      <KeygenFooter />
    </div>
  )
}

export function KeygenSidebar(props: KeygenSidebarProps) {
  return (
    <KeygenProvider {...props}>
      <KeygenSidebarContent />
    </KeygenProvider>
  )
}

