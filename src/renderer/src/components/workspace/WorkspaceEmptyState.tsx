import { LayoutDashboard } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'

interface WorkspaceEmptyStateProps {
  title?: string
  description?: string
}

export function WorkspaceEmptyState({
  title = 'Empty workspace',
  description = 'Move terminal tabs here to start a focused split layout workspace.',
}: WorkspaceEmptyStateProps) {
  return (
    <div className="flex h-full items-center justify-center">
      <EmptyState icon={LayoutDashboard} title={title} description={description} />
    </div>
  )
}
