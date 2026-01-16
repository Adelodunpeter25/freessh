import { useState, useEffect } from "react";
import { ArrowLeft, FolderPlus, RefreshCw, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PathAutocomplete } from "@/components/common/PathAutocomplete";
import { FileInfo } from "@/types";

interface FilePanelHeaderProps {
  title: string;
  currentPath: string;
  loading: boolean;
  showHidden: boolean;
  onNavigate: (path: string) => void;
  onOpenFile: (path: string) => void;
  onRefresh: () => void;
  onGoBack: () => void;
  onToggleHidden: () => void;
  onNewFolder: (name: string) => void;
  fetchSuggestions: (path: string) => Promise<FileInfo[]>;
}

export function FilePanelHeader({
  title,
  currentPath,
  loading,
  showHidden,
  onNavigate,
  onOpenFile,
  onRefresh,
  onGoBack,
  onToggleHidden,
  onNewFolder,
  fetchSuggestions,
}: FilePanelHeaderProps) {
  const [pathInput, setPathInput] = useState(currentPath);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  useEffect(() => {
    setPathInput(currentPath);
  }, [currentPath]);

  const handlePathNavigate = (path: string, isFile: boolean) => {
    if (isFile) {
      onOpenFile(path);
    } else {
      onNavigate(path);
    }
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onNewFolder(newFolderName.trim());
      setNewFolderName("");
      setShowNewFolder(false);
    }
  };

  return (
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
                  onClick={onToggleHidden}
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
      <div className="flex gap-2">
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={onGoBack}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Go Back</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <PathAutocomplete
          value={pathInput}
          onChange={setPathInput}
          onNavigate={handlePathNavigate}
          fetchSuggestions={fetchSuggestions}
          className="h-8 text-sm"
        />
      </div>
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
  );
}
