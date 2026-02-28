import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CommandPaletteItem {
  id: string;
  label: string;
  keywords: string[];
  action: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNewConnection: () => void;
  onNewLocalTerminal: () => void;
  onNewWorkspaceTab: () => void;
  onOpenSettings: () => void;
  onOpenKeyboardShortcuts: () => void;
  onOpenExportImport: () => void;
}

export function CommandPalette({
  open,
  onOpenChange,
  onNewConnection,
  onNewLocalTerminal,
  onNewWorkspaceTab,
  onOpenSettings,
  onOpenKeyboardShortcuts,
  onOpenExportImport,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");

  const items = useMemo<CommandPaletteItem[]>(
    () => [
      {
        id: "new-connection",
        label: "New connection",
        keywords: ["new", "connection", "ssh", "host"],
        action: onNewConnection,
      },
      {
        id: "new-local-terminal",
        label: "New local terminal",
        keywords: ["new", "local", "terminal", "shell"],
        action: onNewLocalTerminal,
      },
      {
        id: "new-workspace-tab",
        label: "New workspace tab",
        keywords: ["new", "workspace", "tab"],
        action: onNewWorkspaceTab,
      },
      {
        id: "open-settings",
        label: "Open settings",
        keywords: ["open", "settings", "preferences"],
        action: onOpenSettings,
      },
      {
        id: "open-shortcuts",
        label: "Open keyboard shortcuts",
        keywords: ["open", "keyboard", "shortcuts", "help"],
        action: onOpenKeyboardShortcuts,
      },
      {
        id: "open-export-import",
        label: "Open export/import",
        keywords: ["open", "export", "import", "backup", "restore"],
        action: onOpenExportImport,
      },
    ],
    [
      onNewConnection,
      onNewLocalTerminal,
      onNewWorkspaceTab,
      onOpenSettings,
      onOpenKeyboardShortcuts,
      onOpenExportImport,
    ],
  );

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return items;

    return items.filter((item) => {
      if (item.label.toLowerCase().includes(normalized)) return true;
      return item.keywords.some((keyword) => keyword.includes(normalized));
    });
  }, [items, query]);

  const runItem = (item: CommandPaletteItem) => {
    onOpenChange(false);
    setQuery("");
    item.action();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) setQuery("");
      }}
    >
      <DialogContent className="max-w-xl p-0 overflow-hidden">
        <DialogHeader className="px-4 pt-4 pb-0">
          <DialogTitle>Command Palette</DialogTitle>
        </DialogHeader>
        <div className="p-4 pt-3">
          <Input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Type a command..."
          />
          <div className="mt-3 max-h-80 overflow-y-auto space-y-1">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <Button
                  key={item.id}
                  type="button"
                  variant="ghost"
                  className="w-full justify-start font-normal h-9"
                  onClick={() => runItem(item)}
                >
                  {item.label}
                </Button>
              ))
            ) : (
              <div className="px-2 py-3 text-sm text-muted-foreground">No commands found.</div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

