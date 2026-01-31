import { TransferProgress } from "@/types";
import { TransferQueue } from "./TransferQueue";

interface SFTPTransferQueueProps {
  transfers: TransferProgress[];
  onCancel: (transferId: string) => Promise<boolean>;
  onClearCompleted: () => void;
}

export function SFTPTransferQueue({ transfers, onCancel, onClearCompleted }: SFTPTransferQueueProps) {
  if (transfers.length === 0) return null;

  return (
    <TransferQueue 
      transfers={transfers} 
      onCancel={onCancel} 
      onClearCompleted={onClearCompleted} 
    />
  );
}
