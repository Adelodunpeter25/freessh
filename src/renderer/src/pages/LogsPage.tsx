import { useLogs } from "@/hooks/logs";
import { LogList } from "@/components/logs";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useTabStore } from "@/stores/tabStore";

export function LogsPage() {
  const { logs, loading, deleteLog } = useLogs();
  const addLogTab = useTabStore((state) => state.addLogTab);

  const handleOpenLog = async (log: any) => {
    const { logService } = await import("@/services/ipc");
    const content = await logService.read(log.filename);
    const title = `Log: ${log.connection_name}`;
    addLogTab(title, content);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Session Logs</h2>
      </div>
      <div className="flex-1 overflow-auto">
        <LogList logs={logs} onDelete={deleteLog} onOpen={handleOpenLog} />
      </div>
    </div>
  );
}
