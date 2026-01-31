import { Suspense } from "react";
import { TerminalSidebar } from "./MainLayoutRoutes";
import { terminalService } from "@/services/ipc/terminal";
import { toast } from "sonner";
import { Snippet } from "@/types/snippet";

interface MainLayoutTerminalSidebarProps {
  showTerminalSettings: boolean;
  mainView: "home" | "sftp" | "terminal";
  activeSessionId: string | undefined;
  onClose: () => void;
  onEditSnippet: (snippet: Snippet) => void;
  onDeleteSnippet: (snippet: Snippet) => void;
  onNewSnippet: () => void;
}

export function MainLayoutTerminalSidebar({
  showTerminalSettings,
  mainView,
  activeSessionId,
  onClose,
  onEditSnippet,
  onDeleteSnippet,
  onNewSnippet
}: MainLayoutTerminalSidebarProps) {
  if (!showTerminalSettings || mainView !== "terminal") return null;

  return (
    <Suspense fallback={null}>
      <TerminalSidebar 
        onClose={onClose}
        onPasteSnippet={(command) => {
          if (activeSessionId) {
            terminalService.sendInput(activeSessionId, command)
          } else {
            toast.error('No active terminal session')
          }
        }}
        onRunSnippet={(command) => {
          if (activeSessionId) {
            terminalService.sendInput(activeSessionId, command + '\n')
          } else {
            toast.error('No active terminal session')
          }
        }}
        onEditSnippet={onEditSnippet}
        onDeleteSnippet={onDeleteSnippet}
        onNewSnippet={onNewSnippet}
        activeSessionId={activeSessionId || null}
      />
    </Suspense>
  );
}
