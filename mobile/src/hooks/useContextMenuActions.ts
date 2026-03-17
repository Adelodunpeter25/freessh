import type {
  ConnectionConfig,
  Group,
  KnownHost,
  LogEntry,
  Snippet,
  SSHKey,
} from '@/types'

const noop = () => {}

export type ContextMenuActions = {
  editGroup: (group: Group) => void
  deleteGroup: (group: Group) => void
  editConnection: (connection: ConnectionConfig) => void
  deleteConnection: (connection: ConnectionConfig) => void
  openSftp: (connection: ConnectionConfig) => void
  duplicateConnection: (connection: ConnectionConfig) => void
  connect: (connection: ConnectionConfig) => void
  editKey: (key: SSHKey) => void
  deleteKey: (key: SSHKey) => void
  editSnippet: (snippet: Snippet) => void
  deleteSnippet: (snippet: Snippet) => void
  editLog: (log: LogEntry) => void
  deleteLog: (log: LogEntry) => void
  editKnownHost: (host: KnownHost) => void
  deleteKnownHost: (host: KnownHost) => void
}

export function useContextMenuActions(): ContextMenuActions {
  return {
    editGroup: noop,
    deleteGroup: noop,
    editConnection: noop,
    deleteConnection: noop,
    openSftp: noop,
    duplicateConnection: noop,
    connect: noop,
    editKey: noop,
    deleteKey: noop,
    editSnippet: noop,
    deleteSnippet: noop,
    editLog: noop,
    deleteLog: noop,
    editKnownHost: noop,
    deleteKnownHost: noop,
  }
}
