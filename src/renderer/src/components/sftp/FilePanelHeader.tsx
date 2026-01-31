import { useState, useEffect, ReactNode } from "react";
import { ArrowLeft, FolderPlus, RefreshCw, Eye, EyeOff, MoreVertical, CheckSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  onSelectAll?: () => void;
  onTitleClick?: () => void;
  fetchSuggestions: (path: string) => Promise<FileInfo[]>;
  children?: ReactNode;
  showNewFolderDialog?: boolean;
  onShowNewFolderDialogChange?: (show: boolean) => void;
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
  onSelectAll,
  onTitleClick,
  fetchSuggestions,
  children,
  showNewFolderDialog: externalShowNewFolder,
  onShowNewFolderDialogChange,
}: FilePanelHeaderProps) {
  const [pathInput, setPathInput] = useState(currentPath);
  const [internalShowNewFolder, setInternalShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const showNewFolder = externalShowNewFolder ?? internalShowNewFolder;
  const setShowNewFolder = onShowNewFolderDialogChange ?? setInternalShowNewFolder;

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
    <TooltipProvider delayDuration={150}>
      <div className="p-3 border-b">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={onTitleClick}
            className="text-sm font-medium hover:bg-accent hover:text-accent-foreground px-2 py-1 rounded border border-transparent hover:border-border transition-colors cursor-pointer"
          >
            {title}
          </button>
          <div className="flex gap-1">
            {children}
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>More Actions</TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowNewFolder(true)}>
                  <FolderPlus className="w-4 h-4 mr-2" />
                  New Folder
                </DropdownMenuItem>
                {onSelectAll && (
                  <DropdownMenuItem onClick={onSelectAll}>
                    <CheckSquare className="w-4 h-4 mr-2" />
                    Select All
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={onToggleHidden}>
                  {showHidden ? (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      Hide Hidden Files
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-4 h-4 mr-2" />
                      Show Hidden Files
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onRefresh} disabled={loading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="flex gap-2">
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
          <PathAutocomplete
            value={pathInput}
            onChange={setPathInput}
            onNavigate={handlePathNavigate}
            fetchSuggestions={fetchSuggestions}
            currentPath={currentPath}
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
    </TooltipProvider>
  );
}
