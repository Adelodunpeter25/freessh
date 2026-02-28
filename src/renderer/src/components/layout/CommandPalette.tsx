import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Braces,
  Command,
  Keyboard,
  Plus,
  Search,
  Settings,
  Terminal,
} from "lucide-react";

interface CommandPaletteItem {
  id: string;
  label: string;
  section: string;
  keywords: string[];
  icon: ReactNode;
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
  const [activeIndex, setActiveIndex] = useState(0);

  const items = useMemo<CommandPaletteItem[]>(
    () => [
      {
        id: "new-connection",
        label: "New connection",
        section: "Quick Create",
        keywords: ["new", "connection", "ssh", "host"],
        icon: <Plus className="h-4 w-4 text-muted-foreground" />,
        action: onNewConnection,
      },
      {
        id: "new-local-terminal",
        label: "New local terminal",
        section: "Quick Create",
        keywords: ["new", "local", "terminal", "shell"],
        icon: <Terminal className="h-4 w-4 text-muted-foreground" />,
        action: onNewLocalTerminal,
      },
      {
        id: "new-workspace-tab",
        label: "New workspace tab",
        section: "Quick Create",
        keywords: ["new", "workspace", "tab"],
        icon: <Braces className="h-4 w-4 text-muted-foreground" />,
        action: onNewWorkspaceTab,
      },
      {
        id: "open-settings",
        label: "Open settings",
        section: "Open",
        keywords: ["open", "settings", "preferences"],
        icon: <Settings className="h-4 w-4 text-muted-foreground" />,
        action: onOpenSettings,
      },
      {
        id: "open-shortcuts",
        label: "Open keyboard shortcuts",
        section: "Open",
        keywords: ["open", "keyboard", "shortcuts", "help"],
        icon: <Keyboard className="h-4 w-4 text-muted-foreground" />,
        action: onOpenKeyboardShortcuts,
      },
      {
        id: "open-export-import",
        label: "Open export/import",
        section: "Open",
        keywords: ["open", "export", "import", "backup", "restore"],
        icon: <Command className="h-4 w-4 text-muted-foreground" />,
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

  const groupedItems = useMemo(() => {
    const groups = new Map<string, CommandPaletteItem[]>();
    for (const item of filteredItems) {
      if (!groups.has(item.section)) {
        groups.set(item.section, []);
      }
      groups.get(item.section)!.push(item);
    }
    return Array.from(groups.entries());
  }, [filteredItems]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  const runItem = (item: CommandPaletteItem) => {
    onOpenChange(false);
    setQuery("");
    setActiveIndex(0);
    item.action();
  };

  const selectedItem = filteredItems[activeIndex] || null;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) setQuery("");
      }}
    >
      <DialogContent className="max-w-xl p-0 overflow-hidden">
        <DialogHeader className="px-4 pt-4 pb-0 sr-only">
          <DialogTitle>Command Palette</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <div className="relative">
            <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (filteredItems.length === 0) return;
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setActiveIndex((prev) => Math.min(prev + 1, filteredItems.length - 1));
                } else if (event.key === "ArrowUp") {
                  event.preventDefault();
                  setActiveIndex((prev) => Math.max(prev - 1, 0));
                } else if (event.key === "Enter" && selectedItem) {
                  event.preventDefault();
                  runItem(selectedItem);
                }
              }}
              placeholder="Search commands"
              className="h-10 pl-9 pr-24"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
              ⌘+Shift+P
            </div>
          </div>

          <div className="mt-4">
            <span className="inline-flex items-center rounded-full bg-muted text-muted-foreground px-3 py-1 text-xs">
              Jump To <span className="ml-2">⌘+J</span>
            </span>
          </div>

          <div className="mt-4 max-h-80 overflow-y-auto space-y-4 pr-1">
            {groupedItems.length > 0 ? (
              groupedItems.map(([section, sectionItems]) => (
                <div key={section}>
                  <div className="px-2 pb-1 text-sm font-semibold text-muted-foreground">{section}</div>
                  <div className="space-y-1">
                    {sectionItems.map((item) => {
                      const index = filteredItems.findIndex((entry) => entry.id === item.id);
                      const isActive = index === activeIndex;
                      return (
                        <Button
                          key={item.id}
                          type="button"
                          variant="ghost"
                          className={`w-full justify-start font-normal h-9 px-3 ${
                            isActive ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-accent/70"
                          }`}
                          onMouseEnter={() => setActiveIndex(index)}
                          onClick={() => runItem(item)}
                        >
                          <span className="mr-2">{item.icon}</span>
                          <span className="text-base">{item.label}</span>
                        </Button>
                      );
                    })}
                  </div>
                </div>
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
