import { Sidebar } from "./Sidebar";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ConnectionsPage, KeygenList, KnownHostsPage, PortForwardPage, SnippetsPage, LogsPage } from "./MainLayoutRoutes";

type SidebarTab = "connections" | "keys" | "known-hosts" | "port-forward" | "snippets" | "logs" | "settings";

interface MainLayoutSidebarProps {
  sidebarTab: SidebarTab;
  onSidebarTabChange: (tab: SidebarTab) => void;
}

export function MainLayoutSidebar({ sidebarTab, onSidebarTabChange }: MainLayoutSidebarProps) {
  const renderHomeContent = () => {
    switch (sidebarTab) {
      case "connections":
        return <ConnectionsPage />;
      case "keys":
        return <KeygenList />;
      case "known-hosts":
        return <KnownHostsPage />;
      case "port-forward":
        return <PortForwardPage />;
      case "snippets":
        return <SnippetsPage />;
      case "logs":
        return <LogsPage />;
      default:
        return null;
    }
  };

  return (
    <ResizablePanelGroup direction="horizontal" autoSaveId="sidebar-layout">
      <ResizablePanel defaultSize={20} minSize={20}>
        <Sidebar activeTab={sidebarTab} onTabChange={onSidebarTabChange} />
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={80}>
        <div className="h-full w-full bg-background overflow-hidden">
          <Suspense fallback={<div className="flex items-center justify-center h-full"><LoadingSpinner /></div>}>
            {renderHomeContent()}
          </Suspense>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
