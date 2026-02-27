const DB_NAME = 'freessh_storage'
const DB_VERSION = 1
const STORE_NAME = 'terminal_scrollback'
const MAX_SCROLLBACK_CHARS = 250_000

interface TerminalScrollbackRecord {
  sessionId: string
  content: string
  updatedAt: number
}

let dbPromise: Promise<IDBDatabase> | null = null

function openDatabase(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'sessionId' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error || new Error('Failed to open IndexedDB'))
  })

  return dbPromise
}

function getRecord(db: IDBDatabase, sessionId: string): Promise<TerminalScrollbackRecord | null> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const request = store.get(sessionId)
    request.onsuccess = () => resolve((request.result as TerminalScrollbackRecord) || null)
    request.onerror = () => reject(request.error || new Error('Failed reading terminal scrollback'))
  })
}

function trimContent(content: string): string {
  if (content.length <= MAX_SCROLLBACK_CHARS) return content
  return content.slice(content.length - MAX_SCROLLBACK_CHARS)
}

export const terminalScrollbackStorage = {
  async load(sessionId: string): Promise<string> {
    if (!sessionId) return ''
    const db = await openDatabase()
    const record = await getRecord(db, sessionId)
    return record?.content || ''
  },

  async append(sessionId: string, chunk: string): Promise<void> {
    if (!sessionId || !chunk) return
    const db = await openDatabase()

    const existing = await getRecord(db, sessionId)
    const next: TerminalScrollbackRecord = {
      sessionId,
      content: trimContent(`${existing?.content || ''}${chunk}`),
      updatedAt: Date.now(),
    }

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      tx.objectStore(STORE_NAME).put(next)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error || new Error('Failed writing terminal scrollback'))
    })
  },

  async clear(sessionId: string): Promise<void> {
    if (!sessionId) return
    const db = await openDatabase()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      tx.objectStore(STORE_NAME).delete(sessionId)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error || new Error('Failed clearing terminal scrollback'))
    })
  },
}

