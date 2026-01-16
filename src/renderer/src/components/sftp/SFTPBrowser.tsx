import { useState, useEffect } from "react";
import { FilePanel } from "./FilePanel";
import { RemotePanel } from "./RemotePanel";
import { TransferQueue } from "./TransferQueue";
import { useSFTP } from "@/hooks/useSFTP";
import { useLocalFiles } from "@/hooks/useLocalFiles";
import { FileInfo } from "@/types";
import { isImageFile, isTextFile } from "@/utils/language";

export function SFTPBrowser() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [selectedRemote, setSelectedRemote] = useState<FileInfo | null>(null);
  const [selectedLocal, setSelectedLocal] = useState<FileInfo | null>(null);
  const [previewFile, setPreviewFile] = useState<{ file: FileInfo; isRemote: boolean } | null>(null);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
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
    if (previewBlobUrl) {
      URL.revokeObjectURL(previewBlobUrl);
      setPreviewBlobUrl(null);
    }

    try {
      if (isTextFile(file.name)) {
        const content = isRemote 
          ? await sftp.readFile(file.path)
          : await window.electron.ipcRenderer.invoke('fs:readfile', file.path);
        setPreviewContent(content);
      } else if (isImageFile(file.name)) {
        if (isRemote) {
          const base64 = await sftp.readFile(file.path, true);
          const binary = atob(base64);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }
          const blob = new Blob([bytes]);
          setPreviewBlobUrl(URL.createObjectURL(blob));
        } else {
          setPreviewBlobUrl(`file://${file.path}`);
        }
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

  const handleClosePreview = () => {
    if (previewBlobUrl) {
      URL.revokeObjectURL(previewBlobUrl);
    }
    setPreviewFile(null);
    setPreviewContent(null);
    setPreviewBlobUrl(null);
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

  // Show preview inline for local panel
  const localPreviewFile = previewFile && !previewFile.isRemote ? previewFile.file : null;
  // Show preview inline for remote panel
  const remotePreviewFile = previewFile && previewFile.isRemote ? previewFile.file : null;

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
            previewFile={localPreviewFile}
            previewContent={previewContent}
            previewBlobUrl={localPreviewFile ? previewBlobUrl : null}
            previewLoading={previewLoading}
            onSaveFile={handleSaveFile}
            onClosePreview={handleClosePreview}
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
            previewFile={remotePreviewFile}
            previewContent={previewContent}
            previewBlobUrl={remotePreviewFile ? previewBlobUrl : null}
            previewLoading={previewLoading}
            onSaveFile={handleSaveFile}
            onClosePreview={handleClosePreview}
          />
        </div>
      </div>
      {sftp.transfers.length > 0 && (
        <TransferQueue transfers={sftp.transfers} onCancel={sftp.cancelTransfer} />
      )}
    </div>
  );
}
