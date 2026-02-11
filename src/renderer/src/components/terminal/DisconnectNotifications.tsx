import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export interface DisconnectNotice {
  sessionId: string;
  tabId: string;
  title: string;
  reason?: string;
  error?: string;
}

interface DisconnectNotificationsProps {
  items: DisconnectNotice[];
  reconnectingSessionId?: string | null;
  onReconnect: (item: DisconnectNotice) => void;
  onClose: (item: DisconnectNotice) => void;
  onDismiss: (item: DisconnectNotice) => void;
}

export function DisconnectNotifications({
  items,
  reconnectingSessionId,
  onReconnect,
  onClose,
  onDismiss
}: DisconnectNotificationsProps) {
  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2 max-w-sm">
      {items.map((item) => {
        const isReconnecting = reconnectingSessionId === item.sessionId;
        const description = item.error || "Connection to remote host was interrupted.";

        return (
          <div key={item.sessionId} className="rounded-lg border bg-background/95 backdrop-blur p-3 shadow-lg">
            <div className="flex items-start justify-between gap-2">
              <div className="text-sm font-medium">Disconnected: {item.title}</div>
              <button
                type="button"
                onClick={() => onDismiss(item)}
                className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="text-xs text-muted-foreground mt-1">{description}</div>
            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                onClick={() => onReconnect(item)}
                disabled={isReconnecting}
              >
                {isReconnecting ? "Reconnecting..." : "Reconnect"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onClose(item)}
              >
                Close Tab
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
