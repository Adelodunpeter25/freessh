import { Button } from '@/components/ui/button'
import { Sheet } from '@/components/ui/sheet'
import { SSHKey } from '@/types/key'
import { KeygenProvider, useKeygenContext } from '@/contexts/KeygenContext'
import { KeygenForm } from './KeygenForm'
import { KeygenFooter } from './KeygenFooter'

interface KeygenSidebarProps {
  isOpen: boolean
  onClose: () => void
  onKeyGenerated?: (key: SSHKey, privateKey: string) => Promise<SSHKey>
  onKeyImported?: (name: string, privateKey: string, passphrase?: string) => Promise<SSHKey>
  onKeyUpdated?: (key: SSHKey) => Promise<void>
  onExportKey?: (key: SSHKey) => void
  editKey?: SSHKey
  importMode?: boolean
}

function KeygenSidebarContent() {
  const { isEditMode, isImportMode } = useKeygenContext()

  const title = isEditMode ? 'Edit SSH Key' : isImportMode ? 'Import SSH Key' : 'Generate SSH Key'

  return (
    <>
      <KeygenForm />
      <KeygenFooter />
    </>
  )
}

export function KeygenSidebar(props: KeygenSidebarProps) {
  const { isOpen, onClose, isEditMode, isImportMode } = props as KeygenSidebarProps & { isEditMode?: boolean; isImportMode?: boolean }
  
  const title = props.editKey ? 'Edit SSH Key' : props.importMode ? 'Import SSH Key' : 'Generate SSH Key'

  return (
    <KeygenProvider {...props}>
      <Sheet isOpen={isOpen} onClose={onClose} title={title}>
        <KeygenSidebarContent />
      </Sheet>
    </KeygenProvider>
  )
}

