import { useState, useEffect } from "react";
import { FilePanel } from "./FilePanel";
import { RemotePanel } from "./RemotePanel";
import { TransferQueue } from "./TransferQueue";
import { FilePreview } from "./filepreview";
import { useSFTP } from "@/hooks/useSFTP";
import { useLocalFiles } from "@/hooks/useLocalFiles";
import { FileInfo } from "@/types";
import { isImageFile, isTextFile } from "@/utils/language";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SFTPBrowser() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [selectedRemote, setSelectedRemote] = useState<FileInfo | null>(null);
  const [selectedLocal, setSelectedLocal] = useState<FileInfo | null>(null);
  const [previewFile, setPreviewFile] = useState<{ file: FileInfo; isRemote: boolean } | null>(null);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const sftp = useSFTP(sessionId);
  const local = useLocalFiles();

  const transferActive = sftp.transfers.some(t => t.status !== 'completed' && t.status !== 'failed');

  useEffect(() => {
    if (sessionId) {
      sftp.listFiles("/");
    }
  }, [sessionId]);

  const handleOpenFile = async (file: FileInfo, isRemote: boolean) => {
    if (file.is_dir) return;
    if (!isTextFile(file.name) && !isImageFile(file.name)) return;

    setPreviewFile({ file, isRemote });
    setPreviewLoading(true);
    setPreviewContent(null);

    try {
      if (isTextFile(file.name)) {
        const content = isRemote 
          ? await sftp.readFile(file.path)
          : await window.electron.ipcRenderer.invoke('fs:readfile', file.path);
        setPreviewContent(content);
      }
    } catch (err) {
      console.error('Failed to read file:', err);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSaveFile = async (content: string) => {
    if (!previewFile) return;
    
    if (previewFile.isRemote) {
      await sftp.writeFile(previewFile.file.path, content);
    } else {
      await window.electron.ipcRenderer.invoke('fs:writefile', previewFile.file.path, content);
    }
    setPreviewContent(content);
  };

  const handleUploadDrop = async (files: FileInfo[], targetPath: string) => {
    for (const file of files) {
      if (file.is_dir) continue;
      const remotePath = targetPath === "/" ? `/${file.name}` : `${targetPath}/${file.name}`;
      await sftp.upload(file.path, remotePath);
    }
  };

  const handleDownloadDrop = async (files: FileInfo[], targetPath: string) => {
    for (const file of files) {
      if (file.is_dir) continue;
      const localPath = `${targetPath}/${file.name}`;
      await sftp.download(file.path, localPath);
      local.refresh();
    }
  };

  return (
    <div className="flex flex-col h-full gap-4 overflow-hidden">
      <div className="flex flex-1 gap-4 overflow-hidden">
        <div className="flex-1 h-full overflow-hidden">
          <FilePanel
            title="Local Files"
            files={local.files}
            currentPath={local.currentPath}
            loading={local.loading}
            isRemote={false}
            onNavigate={local.navigate}
            onRefresh={local.refresh}
            onDelete={local.deleteFile}
            onRename={local.rename}
            onMkdir={local.mkdir}
            onDrop={handleDownloadDrop}
            selectedFile={selectedLocal}
            onSelectFile={setSelectedLocal}
            onOpenFile={(file) => handleOpenFile(file, false)}
            transferActive={transferActive}
          />
        </div>
        <div className="flex-1 h-full overflow-hidden">
          <RemotePanel
            sessionId={sessionId}
            onSessionChange={setSessionId}
            files={sftp.files}
            currentPath={sftp.currentPath}
            loading={sftp.loading}
            onNavigate={sftp.listFiles}
            onRefresh={() => sftp.listFiles(sftp.currentPath)}
            onDelete={sftp.deleteFile}
            onRename={sftp.rename}
            onMkdir={sftp.createDirectory}
            onDrop={handleUploadDrop}
            selectedFile={selectedRemote}
            onSelectFile={setSelectedRemote}
            onOpenFile={(file) => handleOpenFile(file, true)}
            transferActive={transferActive}
          />
        </div>
      </div>
      {sftp.transfers.length > 0 && (
        <TransferQueue transfers={sftp.transfers} onCancel={sftp.cancelTransfer} />
      )}
      
      {previewFile && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-8">
          <div className="bg-background rounded-lg border border-border w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-border">
              <span className="text-sm font-medium">{previewFile.file.name}</span>
              <Button variant="ghost" size="icon" onClick={() => setPreviewFile(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              <FilePreview
                filename={previewFile.file.name}
                content={previewContent}
                blobUrl={isImageFile(previewFile.file.name) ? `file://${previewFile.file.path}` : null}
                isLoading={previewLoading}
                onSave={handleSaveFile}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
