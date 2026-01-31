import { useState, useRef, useCallback } from "react";
import { FileInfo } from "@/types";
import { FilePanelHeader } from "./FilePanelHeader";
import { FileList } from "./FileList";
import { FilePreview } from "./filepreview";
import { DropZoneOverlay } from "@/components/common/DropZoneOverlay";
import { useFilePreviewContext } from "@/contexts/FilePreviewContext";
import { useFilePanelContext } from "@/contexts/FilePanelContext";
import { useDragDrop } from "@/hooks";
import { useSearch } from "@/hooks";
import { openFile as openFileUtil } from "@/utils/fileOpener";
import { SearchBar } from "./SearchBar";

interface FilePanelProps {
  title: string;
  files: FileInfo[];
}

export function FilePanel({
  title,
  files,
}: FilePanelProps) {
  const [showHidden, setShowHidden] = useState(false);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const { 
    currentPath,
    loading,
    isRemote,
    sessionId,
    onNavigate,
    onRefresh,
    onDelete,
    onRename,
    onChmod,
    onMkdir,
    onDrop,
    onDragStart,
    onDownloadToTemp,
    selectedFile,
    onSelectFile,
    fetchSuggestions,
    selectedItems,
    onItemSelect,
    isItemSelected,
    onTitleClick,
  } = useFilePanelContext();
  const { isDragOver, dragProps } = useDragDrop(onDrop, currentPath);
  const { query, setQuery, filteredFiles, clearSearch, isSearching } = useSearch(files);
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
      openFileUtil({
        file,
        isRemote,
        sessionId,
        onOpenInEditor: (f) => openFile(f, isRemote),
        onDownloadToTemp: onDownloadToTemp || (async () => ''),
      });
    }
  }, [onNavigate, openFile, isRemote, sessionId, onDownloadToTemp]);

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
        onTitleClick={onTitleClick}
        fetchSuggestions={fetchSuggestions}
        showNewFolderDialog={showNewFolderDialog}
        onShowNewFolderDialogChange={setShowNewFolderDialog}
      >
        <SearchBar value={query} onChange={setQuery} onClear={clearSearch} />
      </FilePanelHeader>
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
          files={filteredFiles}
          loading={loading}
          showHidden={showHidden}
          onOpenFile={handleOpenFile}
          onNewFolder={() => setShowNewFolderDialog(true)}
          selectedItems={selectedItems}
          onItemSelect={onItemSelect}
          isItemSelected={isItemSelected}
        />
      )}
    </div>
  );
}
