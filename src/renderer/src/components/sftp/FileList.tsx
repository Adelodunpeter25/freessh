import { useMemo, useCallback } from "react";
import { FileInfo } from "@/types";
import { FileItem } from "./FileItem";
import { FilePanelContextMenu } from "@/components/contextmenu";
import { formatDate } from "@/utils/formatDate";
import { formatPermissions } from "@/utils/formatPermissions";
import { formatFileSize } from "@/utils/formatFileSize";

interface FileListProps {
  files: FileInfo[];
  loading: boolean;
  showHidden: boolean;
  selectedFile: FileInfo | null;
  onSelectFile: (file: FileInfo | null) => void;
  onOpenFile: (file: FileInfo) => void;
  onDeleteFile: (path: string) => void;
  onRenameFile: (oldPath: string, newPath: string) => void;
  onChmodFile: (path: string, mode: number) => Promise<void>;
  onDragStart?: (file: FileInfo, e: React.DragEvent) => void;
  onNewFolder: () => void;
  onRefresh: () => void;
  isLocal?: boolean;
}

export function FileList({
  files,
  loading,
  showHidden,
  selectedFile,
  onSelectFile,
  onOpenFile,
  onDeleteFile,
  onRenameFile,
  onChmodFile,
  onDragStart,
  onNewFolder,
  onRefresh,
  isLocal,
}: FileListProps) {
  const sortedFiles = useMemo(() => {
    const filtered = showHidden ? files : files.filter(f => !f.name.startsWith('.'));
    // Pre-compute formatted values to avoid recalculating on every render
    return [...filtered].sort((a, b) => {
      if (a.is_dir && !b.is_dir) return -1;
      if (!a.is_dir && b.is_dir) return 1;
      return a.name.localeCompare(b.name);
    }).map(file => ({
      ...file,
      _formattedDate: formatDate(file.mod_time, isLocal),
      _formattedPerms: formatPermissions(file.mode, file.is_dir),
      _formattedSize: file.is_dir ? '-' : formatFileSize(file.size)
    }));
  }, [files, showHidden, isLocal]);

  const handleRename = useCallback((filePath: string, newName: string) => {
    const newPath = filePath.replace(/[^/]+$/, newName);
    onRenameFile(filePath, newPath);
  }, [onRenameFile]);

  const handleDragStart = useCallback((file: FileInfo, e: React.DragEvent) => {
    e.dataTransfer.setData("application/json", JSON.stringify([file]));
    onDragStart?.(file, e);
  }, [onDragStart]);

  return (
    <>
      <div className="grid grid-cols-[1fr_100px_90px_70px] items-center gap-2 px-3 py-1 border-b text-xs text-muted-foreground font-medium">
        <span>Name</span>
        <span>Modified</span>
        <span>Perms</span>
        <span className="text-right">Size</span>
      </div>
      <FilePanelContextMenu onNewFolder={onNewFolder} onRefresh={onRefresh}>
        <div className="flex-1 overflow-auto scrollbar-hide">
          {sortedFiles.map((file) => (
            <FileItem
              key={file.path}
              file={file}
              selected={selectedFile?.path === file.path}
              onSelect={() => onSelectFile(file)}
              onOpen={() => onOpenFile(file)}
              onDelete={() => onDeleteFile(file.path)}
              onRename={(newName) => handleRename(file.path, newName)}
              onChmod={(mode) => onChmodFile(file.path, mode)}
              draggable
              onDragStart={(e) => handleDragStart(file, e)}
              formattedDate={file._formattedDate}
              formattedPerms={file._formattedPerms}
              formattedSize={file._formattedSize}
            />
          ))}
          {loading && files.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Loading...
            </div>
          )}
          {!loading && files.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Empty folder
            </div>
          )}
        </div>
      </FilePanelContextMenu>
    </>
  );
}
