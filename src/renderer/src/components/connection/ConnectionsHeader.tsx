import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ConnectionHeaderButton } from "./ConnectionHeaderButton";
import { useConnectionsContext } from "@/contexts/ConnectionsContext";

export function ConnectionsHeader() {
  const {
    searchQuery,
    onSearchChange,
    filteredConnections,
    onConnect,
    onOpenSFTP,
    onNewConnection,
    onNewLocalTerminal,
    onNewGroup,
    localTerminalLoading,
  } = useConnectionsContext();

  const isSearching = searchQuery.trim().length > 0;
  const singleResult =
    isSearching && filteredConnections.length === 1
      ? filteredConnections[0]
      : null;

  return (
    <div className="flex flex-col px-4 py-3 border-b bg-background/95">
      {/* Search Bar */}
      <div className="flex items-center gap-2 pb-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Find a host or ssh user@hostname..."
            className="pl-10 pr-10 bg-muted/50"
          />
          {isSearching && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {singleResult && (
          <>
            <Button
              size="sm"
              onClick={() => onConnect(singleResult)}
              className="shrink-0"
            >
              Connect
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onOpenSFTP(singleResult)}
              className="shrink-0"
            >
              Open SFTP
            </Button>
          </>
        )}
      </div>

      {/* Separator */}
      <div className="h-px bg-border mb-3" />

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <ConnectionHeaderButton
          onNewConnection={onNewConnection}
          onNewLocalTerminal={onNewLocalTerminal}
          onNewGroup={onNewGroup}
          localTerminalLoading={localTerminalLoading}
        />
      </div>
    </div>
  );
}
