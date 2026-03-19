import { useMemo, useCallback, useState, useRef, useEffect } from "react";
import { FileInfo } from "@/types";
import { FileItem } from "./FileItem";
import { FilePanelContextMenu } from "@/components/contextmenu";
import { useFilePanelContext } from "@/contexts/FilePanelContext";
import { formatDate } from "@/utils/formatDate";
import { formatPermissions } from "@/utils/formatPermissions";
import { formatFileSize } from "@/utils/formatFileSize";

interface FileListProps {
  files: FileInfo[];
  loading: boolean;
  showHidden: boolean;
  onOpenFile: (file: FileInfo) => void;
  onNewFolder: () => void;
  selectedItems?: Set<string>;
  onItemSelect?: (items: FileInfo[], file: FileInfo, index: number, event: React.MouseEvent) => void;
  isItemSelected?: (fileName: string) => boolean;
}

const ITEM_HEIGHT = 88; // Height of FileItem in pixels
const BUFFER_ITEMS = 20; // Number of items to render above/below the visible area

export function FileList({
  files,
  loading,
  showHidden,
  onOpenFile,
  onNewFolder,
  onItemSelect,
  isItemSelected,
}: FileListProps) {
  const {
    selectedFile,
    onSelectFile,
    onDelete,
    onRename,
    onChmod,
    onDragStart,
    onRefresh,
    isRemote,
  } = useFilePanelContext();

  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  const sortedFiles = useMemo(() => {
    const filtered = showHidden ? files : files.filter(f => !f.name.startsWith('.'));
    
    // Sort first, then map. Sorting is more expensive on smaller sets.
    const sorted = [...filtered].sort((a, b) => {
      if (a.is_dir && !b.is_dir) return -1;
      if (!a.is_dir && b.is_dir) return 1;
      return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
    });

    // Only compute formatted strings once per file info change
    return sorted.map(file => ({
      ...file,
      _formattedDate: formatDate(file.mod_time, !isRemote),
      _formattedPerms: formatPermissions(file.mode, file.is_dir),
      _formattedSize: file.is_dir ? '-' : formatFileSize(file.size)
    }));
  }, [files, showHidden, isRemote]);

  const { visibleFiles, totalHeight, offsetY } = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER_ITEMS);
    const endIndex = Math.min(
      sortedFiles.length,
      Math.ceil((scrollTop + containerHeight) / ITEM_HEIGHT) + BUFFER_ITEMS
    );

    return {
      visibleFiles: sortedFiles.slice(startIndex, endIndex).map((file, i) => ({
        file,
        index: startIndex + i
      })),
      totalHeight: sortedFiles.length * ITEM_HEIGHT,
      offsetY: startIndex * ITEM_HEIGHT
    };
  }, [sortedFiles, scrollTop, containerHeight]);

  const handleRename = useCallback((filePath: string, newName: string) => {
    const newPath = filePath.replace(/[^/]+$/, newName);
    onRename(filePath, newPath);
  }, [onRename]);

  const handleDragStart = useCallback((file: FileInfo, e: React.DragEvent) => {
    e.dataTransfer.setData("application/json", JSON.stringify([file]));
    onDragStart?.(file);
  }, [onDragStart]);

  const handleSelectFile = useCallback((file: FileInfo) => {
    onSelectFile(file);
  }, [onSelectFile]);

  const handleOpenFile = useCallback((file: FileInfo) => {
    onOpenFile(file);
  }, [onOpenFile]);

  const handleDeleteFile = useCallback((path: string) => {
    return onDelete(path);
  }, [onDelete]);

  const handleChmodFile = useCallback((path: string, mode: number) => {
    return onChmod(path, mode);
  }, [onChmod]);

  const handleItemClick = useCallback((file: FileInfo, index: number, e: React.MouseEvent) => {
    onItemSelect?.(sortedFiles, file, index, e);
  }, [onItemSelect, sortedFiles]);

  return (
    <>
      <div className="grid grid-cols-[1fr_100px_90px_70px] items-center gap-2 px-3 py-1 border-b text-xs text-muted-foreground font-medium">
        <span>Name</span>
        <span>Modified</span>
        <span>Perms</span>
        <span className="text-right">Size</span>
      </div>
      <FilePanelContextMenu onNewFolder={onNewFolder} onRefresh={onRefresh}>
        <div 
          ref={containerRef}
          className="flex-1 overflow-auto relative"
          onScroll={handleScroll}
        >
          <div style={{ height: totalHeight, width: '100%' }}>
            <div style={{ transform: `translateY(${offsetY}px)` }}>
              {visibleFiles.map(({ file, index }) => (
                <FileItem
                  key={file.path}
                  file={file}
                  selected={selectedFile?.path === file.path}
                  multiSelected={isItemSelected?.(file.name) || false}
                  onSelect={() => handleSelectFile(file)}
                  onOpen={() => handleOpenFile(file)}
                  onDelete={() => handleDeleteFile(file.path)}
                  onRename={(newName) => handleRename(file.path, newName)}
                  onChmod={(mode) => handleChmodFile(file.path, mode)}
                  draggable
                  onDragStart={(e) => handleDragStart(file, e)}
                  onClick={(e) => handleItemClick(file, index, e)}
                  formattedDate={file._formattedDate}
                  formattedPerms={file._formattedPerms}
                  formattedSize={file._formattedSize}
                />
              ))}
            </div>
          </div>
          {loading && files.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground absolute inset-0 flex items-center justify-center bg-background/50">
              Loading...
            </div>
          )}
          {!loading && files.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground absolute inset-0 flex items-center justify-center">
              Empty folder
            </div>
          )}
        </div>
      </FilePanelContextMenu>
    </>
  );
}
