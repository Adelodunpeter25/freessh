export interface FileInfo {
  name: string
  path: string
  size: number
  mode: number
  mod_time: number
  is_dir: boolean
}

export interface TransferProgress {
  transfer_id: string
  filename: string
  total: number
  transferred: number
  percentage: number
  status: 'uploading' | 'downloading' | 'completed' | 'failed'
}

export interface ListRequest {
  path: string
}

export interface UploadRequest {
  local_path: string
  remote_path: string
}

export interface DownloadRequest {
  remote_path: string
  local_path: string
}

export interface DeleteRequest {
  path: string
}

export interface MkdirRequest {
  path: string
}

export interface RenameRequest {
  old_path: string
  new_path: string
}

export interface RemoteTransferResult {
  source_path: string
  dest_path: string
  success: boolean
  error?: string
}

export interface RemoteTransferProgress {
  total_items: number
  completed_items: number
  failed_items: number
  current_item: string
  bytes_transferred: number
  total_bytes: number
}
