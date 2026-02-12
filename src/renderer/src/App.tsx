import { useEffect, useState } from "react";
import { MainLayout } from "./components/layout/MainLayout";
import { WorkspaceEmptyState, WorkspaceShell, WorkspaceSidebar } from "./components/workspace";
import { Toaster } from "./components/ui/sonner";
import { useBackend } from "./hooks";
import { FEATURE_FLAGS } from "./constants/features";
import type { WorkspaceTabModel } from "./types/workspace";

function App(): React.JSX.Element {
  useBackend();
  const [windowMode, setWindowMode] = useState<"primary" | "workspace">("primary");

  useEffect(() => {
    let disposed = false;

    const syncContext = async () => {
      try {
        const context = await window.electron.ipcRenderer.invoke("workspace:get-window-context");
        if (!disposed && context?.mode === "workspace") {
          setWindowMode("workspace");
        }
      } catch {
        // Keep primary mode fallback.
      }
    };

    const handleMode = (_event: unknown, payload: { mode?: "primary" | "workspace" }) => {
      if (!FEATURE_FLAGS.DETACHABLE_WORKSPACES) return;
      if (payload?.mode === "workspace") {
        setWindowMode("workspace");
        return;
      }
      setWindowMode("primary");
    };

    syncContext();
    window.electron.ipcRenderer.on("workspace:window-mode", handleMode);

    return () => {
      disposed = true;
    };
  }, []);

  const showWorkspace = FEATURE_FLAGS.DETACHABLE_WORKSPACES && windowMode === "workspace";
  const workspaceTabs: WorkspaceTabModel[] = [];

  return (
    <>
      {showWorkspace ? (
        <WorkspaceShell
          title="Workspace"
          sidebar={<WorkspaceSidebar tabs={workspaceTabs} activeTabId={null} />}
          content={<WorkspaceEmptyState />}
        />
      ) : (
        <MainLayout />
      )}
      <Toaster />
    </>
  );
}

export default App;
