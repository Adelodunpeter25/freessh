import { useEffect, useState } from "react";
import { MainLayout } from "./components/layout/MainLayout";
import { TitleBar } from "./components/layout/TitleBar";
import { WorkspaceEmptyState, WorkspaceShell, WorkspaceSidebar } from "./components/workspace";
import { Toaster } from "./components/ui/sonner";
import { useBackend } from "./hooks";
import { useWorkspace } from "./hooks/workspace";
import { FEATURE_FLAGS } from "./constants/features";
import type { WorkspaceTabModel } from "./types/workspace";

function App(): React.JSX.Element {
  useBackend();
  const [windowMode, setWindowMode] = useState<"primary" | "workspace">("primary");
  const [windowId, setWindowId] = useState<number | null>(null);
  const [workspaceTabs, setWorkspaceTabs] = useState<WorkspaceTabModel[]>([]);
  const { registerWindow, createWorkspace, listTabs } = useWorkspace();

  useEffect(() => {
    let disposed = false;

    const syncContext = async () => {
      try {
        const context = await window.electron.ipcRenderer.invoke("workspace:get-window-context");
        if (!disposed) {
          if (context?.mode === "workspace") {
            setWindowMode("workspace");
          }
          if (typeof context?.windowId === "number") {
            setWindowId(context.windowId);
          }
        }
      } catch {
        // Keep primary mode fallback.
      }
    };

    const handleMode = (_event: unknown, payload: { mode?: "primary" | "workspace"; windowId?: number }) => {
      if (!FEATURE_FLAGS.DETACHABLE_WORKSPACES) return;
      if (payload?.mode === "workspace") {
        setWindowMode("workspace");
      } else {
        setWindowMode("primary");
      }
      if (typeof payload?.windowId === "number") {
        setWindowId(payload.windowId);
      }
    };

    syncContext();
    window.electron.ipcRenderer.on("workspace:window-mode", handleMode);

    return () => {
      disposed = true;
    };
  }, []);

  const showWorkspace = FEATURE_FLAGS.DETACHABLE_WORKSPACES && windowMode === "workspace";

  useEffect(() => {
    if (!showWorkspace || !windowId || windowId < 0) return;

    let cancelled = false;
    const windowIdString = String(windowId);

    const setupWorkspace = async () => {
      try {
        await registerWindow({ window_id: windowIdString, mode: "workspace" });
        await createWorkspace({ window_id: windowIdString, name: `Workspace ${windowIdString}` });
      } catch {
        // Workspace may already exist or feature may be disabled in backend.
      }

      try {
        const response = await listTabs({ window_id: windowIdString });
        if (!cancelled) {
          setWorkspaceTabs(response.tabs ?? []);
        }
      } catch {
        if (!cancelled) {
          setWorkspaceTabs([]);
        }
      }
    };

    setupWorkspace();

    return () => {
      cancelled = true;
    };
  }, [showWorkspace, windowId, registerWindow, createWorkspace, listTabs]);

  return (
    <>
      {showWorkspace ? (
        <div className="h-screen w-screen flex flex-col overflow-hidden">
          <TitleBar
            showHome={false}
            showSFTP={false}
            showTerminal={false}
            sidebarOpen={false}
            onHomeClick={() => {}}
            onSFTPClick={() => {}}
            onSessionClick={() => {}}
            onSidebarToggle={() => {}}
          />
          <div className="flex-1 overflow-hidden">
            <WorkspaceShell
              title="Workspace"
              sidebar={<WorkspaceSidebar tabs={workspaceTabs} activeTabId={null} />}
              content={<WorkspaceEmptyState />}
            />
          </div>
        </div>
      ) : (
        <MainLayout />
      )}
      <Toaster />
    </>
  );
}

export default App;
