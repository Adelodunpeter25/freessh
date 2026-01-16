import { useState, useEffect, useMemo } from "react";
import { ArrowLeft, FolderPlus, RefreshCw, Eye, EyeOff } from "lucide-react";
import { FileInfo } from "@/types";
import { FileItem } from "./FileItem";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FilePanelContextMenu } from "@/components/contextmenu";
import { DropZoneOverlay } from "@/components/common/DropZoneOverlay";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FilePreview } from "./filepreview";

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
  onMkdir: (path: string) => void;
  onDrop?: (files: FileInfo[], targetPath: string) => void;
  onDragStart?: (file: FileInfo) => void;
  selectedFile: FileInfo | null;
  onSelectFile: (file: FileInfo | null) => void;
  onOpenFile?: (file: FileInfo) => void;
  transferActive?: boolean;
  previewFile?: FileInfo | null;
  previewContent?: string | null;
  previewBlobUrl?: string | null;
  previewLoading?: boolean;
  onSaveFile?: (content: string) => void;
  onClosePreview?: () => void;
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
  onMkdir,
  onDrop,
  onDragStart,
  selectedFile,
  onSelectFile,
  onOpenFile,
  transferActive = false,
  previewFile,
  previewContent,
  previewBlobUrl,
  previewLoading,
  onSaveFile,
  onClosePreview,
}: FilePanelProps) {
  const [pathInput, setPathInput] = useState(currentPath);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [showHidden, setShowHidden] = useState(false);

  useEffect(() => {
    setPathInput(currentPath);
  }, [currentPath]);

  const handlePathSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate(pathInput);
  };

  const handleGoUp = () => {
    if (previewFile) {
      onClosePreview?.();
    } else {
      const parent = currentPath.split("/").slice(0, -1).join("/") || "/";
      onNavigate(parent);
    }
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      const newPath =
        currentPath === "/"
          ? `/${newFolderName}`
          : `${currentPath}/${newFolderName}`;
      onMkdir(newPath);
      setNewFolderName("");
      setShowNewFolder(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const data = e.dataTransfer.getData("application/json");
    if (data && onDrop) {
      const droppedFiles = JSON.parse(data) as FileInfo[];
      onDrop(droppedFiles, currentPath);
    }
  };

  const sortedFiles = useMemo(() => {
    const filtered = showHidden ? files : files.filter(f => !f.name.startsWith('.'));
    return [...filtered].sort((a, b) => {
      if (a.is_dir && !b.is_dir) return -1;
      if (!a.is_dir && b.is_dir) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [files, showHidden]);

  return (
    <div
      className="relative flex flex-col h-full border rounded-lg bg-card"
      onDragOver={handleDragOver}
      onDragEnter={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <DropZoneOverlay 
        visible={isDragOver} 
        type={isRemote ? 'upload' : 'download'} 
        message={isRemote ? 'Upload files here' : 'Download files here'} 
      />
      <div className="p-3 border-b">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">{title}</span>
          <TooltipProvider delayDuration={150}>
            <div className="flex gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setShowNewFolder(true)}
                  >
                    <FolderPlus className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>New folder</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setShowHidden(!showHidden)}
                  >
                    {showHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{showHidden ? "Hide hidden files" : "Show hidden files"}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={onRefresh}
                    disabled={loading}
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Refresh</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>
        <form onSubmit={handlePathSubmit} className="flex gap-2">
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={handleGoUp}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Go Back</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Input
            value={pathInput}
            onChange={(e) => setPathInput(e.target.value)}
            className="h-8 text-sm"
            placeholder="Path..."
          />
        </form>
        {showNewFolder && (
          <div className="flex gap-2 mt-2">
            <Input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="h-8 text-sm"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
            />
            <Button size="sm" onClick={handleCreateFolder}>
              Create
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowNewFolder(false)}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
      {previewFile ? (
        <div className="flex-1 overflow-hidden">
          <FilePreview
            filename={previewFile.name}
            content={previewContent ?? null}
            blobUrl={previewBlobUrl ?? null}
            isLoading={previewLoading ?? false}
            onSave={onSaveFile}
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-[1fr_100px_90px_70px] items-center gap-2 px-3 py-1 border-b text-xs text-muted-foreground font-medium">
            <span>Name</span>
            <span>Modified</span>
            <span>Perms</span>
            <span className="text-right">Size</span>
          </div>
          <FilePanelContextMenu onNewFolder={() => setShowNewFolder(true)} onRefresh={onRefresh}>
            <div className="flex-1 overflow-auto scrollbar-hide">
              {sortedFiles.map((file) => (
                <FileItem
                  key={file.path}
                  file={file}
                  selected={selectedFile?.path === file.path}
                  onSelect={() => onSelectFile(file)}
                  onOpen={() => file.is_dir ? onNavigate(file.path) : onOpenFile?.(file)}
                  onDelete={() => onDelete(file.path)}
                  onRename={(newName) => {
                    const newPath = file.path.replace(/[^/]+$/, newName);
                    onRename(file.path, newPath);
                  }}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData(
                      "application/json",
                      JSON.stringify([file]),
                    );
                    onDragStart?.(file);
                  }}
                />
              ))}
              {!loading && files.length === 0 && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Empty folder
                </div>
              )}
            </div>
          </FilePanelContextMenu>
        </>
      )}
    </div>
  );
}
