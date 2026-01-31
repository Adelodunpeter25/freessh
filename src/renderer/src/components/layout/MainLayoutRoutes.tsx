import { lazy } from "react";

export const ConnectionsPage = lazy(() => import("@/pages/ConnectionsPage").then(m => ({ default: m.ConnectionsPage })));
export const SFTPPage = lazy(() => import("@/pages/SFTPPage"));
export const TerminalView = lazy(() => import("@/components/terminal/TerminalView").then(m => ({ default: m.TerminalView })));
export const TerminalSidebar = lazy(() => import("@/components/terminal/TerminalSidebar").then(m => ({ default: m.TerminalSidebar })));
export const KeygenList = lazy(() => import("@/components/keygen").then(m => ({ default: m.KeygenList })));
export const KnownHostsPage = lazy(() => import("@/pages/KnownHostsPage").then(m => ({ default: m.KnownHostsPage })));
export const PortForwardPage = lazy(() => import("@/pages/PortForwardPage").then(m => ({ default: m.PortForwardPage })));
export const SnippetsPage = lazy(() => import("@/pages/SnippetsPage").then(m => ({ default: m.SnippetsPage })));
export const SnippetForm = lazy(() => import("@/components/snippets").then(m => ({ default: m.SnippetForm })));
export const LogsPage = lazy(() => import("@/pages/LogsPage").then(m => ({ default: m.LogsPage })));
export const LogViewer = lazy(() => import("@/components/logs").then(m => ({ default: m.LogViewer })));
