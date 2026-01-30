import { useState, useRef } from 'react'
import { useImport } from '@/hooks'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Upload, FileText } from 'lucide-react'

export function ImportTab() {
  const { importing, importFreeSSH, importOpenSSH } = useImport()
  const [format, setFormat] = useState<'freessh' | 'openssh'>('freessh')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleImport = async () => {
    if (!selectedFile) return

    if (format === 'freessh') {
      await importFreeSSH(selectedFile)
    } else if (format === 'openssh') {
      await importOpenSSH(selectedFile)
    }
    
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleBrowse = () => {
    fileInputRef.current?.click()
  }

  const acceptedFileTypes = format === 'freessh' ? '.json' : '.conf,.config,*'

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <Label className="text-sm font-medium mb-2 block">Import Format</Label>
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50">
            <input
              type="radio"
              id="import-format-freessh"
              name="import-format"
              value="freessh"
              checked={format === 'freessh'}
              onChange={(e) => setFormat(e.target.value as 'freessh')}
              className="w-4 h-4"
            />
            <label htmlFor="import-format-freessh" className="flex-1 cursor-pointer">
              <div className="font-medium">FreeSSH Format</div>
              <div className="text-xs text-muted-foreground">
                Import connections, groups, port forwards, and keys from JSON
              </div>
            </label>
          </div>

          <div className="flex items-center gap-2 p-3 border rounded-lg">
            <input
              type="radio"
              id="import-format-openssh"
              name="import-format"
              value="openssh"
              checked={format === 'openssh'}
              onChange={(e) => setFormat(e.target.value as 'openssh')}
              className="w-4 h-4"
            />
            <label htmlFor="import-format-openssh" className="flex-1 cursor-pointer">
              <div className="font-medium">OpenSSH Config</div>
              <div className="text-xs text-muted-foreground">
                Import connections from OpenSSH config file (~/.ssh/config)
              </div>
            </label>
          </div>
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">Select File</Label>
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFileTypes}
          onChange={handleFileSelect}
          className="hidden"
        />
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleBrowse}
            className="flex-1"
            disabled={importing}
          >
            <Upload className="w-4 h-4 mr-2" />
            Browse File
          </Button>
        </div>
        {selectedFile && (
          <div className="mt-2 p-2 border rounded-lg flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <span className="flex-1 truncate">{selectedFile.name}</span>
            <span className="text-xs text-muted-foreground">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </span>
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button onClick={handleImport} disabled={!selectedFile || importing}>
          <Upload className="w-4 h-4 mr-2" />
          {importing ? 'Importing...' : 'Import'}
        </Button>
      </div>
    </div>
  )
}
