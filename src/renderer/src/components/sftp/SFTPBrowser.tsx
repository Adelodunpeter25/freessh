import { useState, useEffect } from "react";
import { FilePanel } from "./FilePanel";
import { RemotePanel } from "./RemotePanel";
import { TransferQueue } from "./TransferQueue";
import { useSFTP } from "@/hooks/useSFTP";
import { useLocalFiles } from "@/hooks/useLocalFiles";
import { useFilePreview } from "@/hooks/useFilePreview";
import { FilePreviewProvider } from "@/contexts/FilePreviewContext";
import { FileInfo } from "@/types";

export function SFTPBrowser() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [selectedRemote, setSelectedRemote] = useState<FileInfo | null>(null);
  const [selectedLocal, setSelectedLocal] = useState<FileInfo | null>(null);

  const sftp = useSFTP(sessionId);
  const local = useLocalFiles();
  const preview = useFilePreview(sftp.readFile, sftp.writeFile);

  const transferActive = sftp.transfers.some(t => t.status !== 'completed' && t.status !== 'failed');

  useEffect(() => {
    if (sessionId) {
      sftp.listFiles("/");
    }
  }, [sessionId]);

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
    <FilePreviewProvider value={preview}>
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
              onChmod={local.chmod}
              onMkdir={local.mkdir}
              onDrop={handleDownloadDrop}
              selectedFile={selectedLocal}
              onSelectFile={setSelectedLocal}
              transferActive={transferActive}
              fetchSuggestions={local.listPath}
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
              onChmod={sftp.chmod}
              onMkdir={sftp.createDirectory}
              onDrop={handleUploadDrop}
              selectedFile={selectedRemote}
              onSelectFile={setSelectedRemote}
              transferActive={transferActive}
              fetchSuggestions={sftp.listPath}
            />
          </div>
        </div>
        {sftp.transfers.length > 0 && (
          <TransferQueue transfers={sftp.transfers} onCancel={sftp.cancelTransfer} />
        )}
      </div>
    </FilePreviewProvider>
  );
}
