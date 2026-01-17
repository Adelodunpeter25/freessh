import { useState, useRef, useCallback } from "react";
import { FileInfo } from "@/types";
import { FilePanelHeader } from "./FilePanelHeader";
import { FileList } from "./FileList";
import { FilePreview } from "./filepreview";
import { DropZoneOverlay } from "@/components/common/DropZoneOverlay";
import { useFilePreviewContext } from "@/contexts/FilePreviewContext";
import { useDragDrop } from "@/hooks/useDragDrop";

interface FilePanelProps {
  title: string;
  files: FileInfo[];
  currentPath: string;
  loading: boolean;
  isRemote?: boolean;
  onNavigate: (path: string) => void;
  onRefresh: () => void;
  onDelete: (path: string) => Promise<void>;
  onRename: (oldPath: string, newPath: string) => void;
  onChmod: (path: string, mode: number) => Promise<void>;
  onMkdir: (path: string) => void;
  onDrop?: (files: FileInfo[], targetPath: string) => void;
  onDragStart?: (file: FileInfo) => void;
  selectedFile: FileInfo | null;
  onSelectFile: (file: FileInfo | null) => void;
  transferActive?: boolean;
  fetchSuggestions: (path: string) => Promise<FileInfo[]>;
}

export function FilePanel({
  title,
  files,
  currentPath,
  loading,
  isRemote = false,
  onNavigate,
  onRefresh,
  onDelete,
  onRename,
  onChmod,
  onMkdir,
  onDrop,
  onDragStart,
  selectedFile,
  onSelectFile,
  fetchSuggestions,
}: FilePanelProps) {
  const [showHidden, setShowHidden] = useState(false);
  const { isDragOver, dragProps } = useDragDrop(onDrop, currentPath);
  const { 
    previewFile, 
    isRemotePreview, 
    previewContent, 
    previewBlobUrl, 
    previewLoading, 
    openFile, 
    saveFile, 
    closePreview 
  } = useFilePreviewContext();

  const navigateTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showPreview = previewFile && isRemotePreview === isRemote;

  const handleGoBack = () => {
    if (showPreview) {
      closePreview();
    } else {
      const parent = currentPath.split("/").slice(0, -1).join("/") || "/";
      onNavigate(parent);
    }
  };

  const handleNewFolder = (name: string) => {
    const newPath = currentPath === "/" ? `/${name}` : `${currentPath}/${name}`;
    onMkdir(newPath);
  };

  const handleOpenFile = useCallback((file: FileInfo) => {
    if (file.is_dir) {
      // Debounce navigation to prevent rapid clicks
      if (navigateTimerRef.current) {
        clearTimeout(navigateTimerRef.current);
      }
      navigateTimerRef.current = setTimeout(() => {
        onNavigate(file.path);
      }, 50);
    } else {
      openFile(file, isRemote);
    }
  }, [onNavigate, openFile, isRemote]);

  const handleOpenFilePath = (path: string) => {
    openFile({ name: path.split('/').pop() || '', path, is_dir: false, size: 0, mode: 0, mod_time: 0 }, isRemote);
  };

  return (
    <div className="relative flex flex-col h-full border rounded-lg bg-card" {...dragProps}>
      <DropZoneOverlay 
        visible={isDragOver} 
        type={isRemote ? 'upload' : 'download'} 
        message={isRemote ? 'Upload files here' : 'Download files here'} 
      />
      <FilePanelHeader
        title={title}
        currentPath={currentPath}
        loading={loading}
        showHidden={showHidden}
        onNavigate={onNavigate}
        onOpenFile={handleOpenFilePath}
        onRefresh={onRefresh}
        onGoBack={handleGoBack}
        onToggleHidden={() => setShowHidden(!showHidden)}
        onNewFolder={handleNewFolder}
        fetchSuggestions={fetchSuggestions}
      />
      {showPreview ? (
        <div className="flex-1 overflow-hidden">
          <FilePreview
            filename={previewFile.name}
            content={previewContent}
            blobUrl={previewBlobUrl}
            isLoading={previewLoading}
            onSave={saveFile}
          />
        </div>
      ) : (
        <FileList
          files={files}
          loading={loading}
          showHidden={showHidden}
          selectedFile={selectedFile}
          onSelectFile={onSelectFile}
          onOpenFile={handleOpenFile}
          onDeleteFile={onDelete}
          onRenameFile={onRename}
          onChmodFile={onChmod}
          onDragStart={onDragStart}
          onNewFolder={() => {}}
          onRefresh={onRefresh}
          isLocal={!isRemote}
        />
      )}
    </div>
  );
}
