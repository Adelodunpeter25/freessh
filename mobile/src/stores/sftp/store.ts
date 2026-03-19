import { create } from 'zustand'
import * as FileSystem from 'expo-file-system/legacy'
import { Platform } from 'react-native'
import { sshService } from '@/services'
import { sftpService } from '@/services/sftp'
import { connectionService, keyService } from '@/services/crud'
import type { ConnectionConfig } from '@/types'
import {
  fileNameFromPath,
  normalizePath,
  parentPath,
  resolveRemotePath,
} from '@/utils/sftpPaths'
import type { SftpDeleteTarget, SftpSession, SftpState } from './types'
import {
  getActiveSession,
  normalizeEntries,
  normalizePassphrase,
  normalizePrivateKey,
  updateSession,
} from './helpers'

export const useSftpStore = create<SftpState>((set, get) => ({
  sessions: [],
  activeSessionId: null,
  connectingByConnectionId: {},

  connect: async (connection: ConnectionConfig) => {
    set((state) => ({
      connectingByConnectionId: {
        ...state.connectingByConnectionId,
        [connection.id]: true,
      },
    }))
    const latestConnection = await connectionService.getById(connection.id).catch(() => null)
    const effectiveConnection = latestConnection ?? connection
    const port = effectiveConnection.port ?? 22

    try {
      let client
      if (effectiveConnection.auth_method === 'password') {
        if (!effectiveConnection.password) throw new Error('Missing password')
        client = await sshService.connectWithPassword(
          effectiveConnection.host,
          port,
          effectiveConnection.username,
          effectiveConnection.password,
        )
      } else {
        const candidates: Array<{ key: string; passphrase?: string }> = []

        if (effectiveConnection.key_id) {
          const key = await keyService.getById(effectiveConnection.key_id)
          if (key?.private_key) {
            const preferredPassphrase =
              normalizePassphrase(effectiveConnection.passphrase) ??
              normalizePassphrase(key.passphrase)
            candidates.push({
              key: normalizePrivateKey(key.private_key),
              passphrase: preferredPassphrase,
            })
            if (preferredPassphrase) {
              candidates.push({
                key: normalizePrivateKey(key.private_key),
                passphrase: undefined,
              })
            }
          }
        }

        if (effectiveConnection.private_key?.trim()) {
          const normalized = normalizePrivateKey(effectiveConnection.private_key)
          const exists = candidates.some((candidate) => candidate.key === normalized)
          if (!exists) {
            candidates.push({
              key: normalized,
              passphrase: normalizePassphrase(effectiveConnection.passphrase),
            })
          }
        }

        if (candidates.length === 0) throw new Error('Missing private key')

        let lastError: unknown
        let connectedClient: Awaited<ReturnType<typeof sshService.connectWithPassword>> | null = null
        for (const candidate of candidates) {
          try {
            connectedClient = await sshService.connectWithKey(
              effectiveConnection.host,
              port,
              effectiveConnection.username,
              candidate.key,
              candidate.passphrase,
            )
            break
          } catch (error) {
            lastError = error
          }
        }

        if (!connectedClient) {
          throw lastError instanceof Error ? lastError : new Error('Failed to authenticate with private key')
        }

        client = connectedClient
      }

      await sftpService.connect(client)
      const rootPath = '/'
      const results = await sftpService.list(client, rootPath)
      const files = normalizeEntries(results, rootPath)
      const id = `${connection.id}-${Date.now()}`
      const session: SftpSession = {
        id,
        connectionName: effectiveConnection.name,
        client,
        currentPath: rootPath,
        files,
        loading: false,
        connected: true,
        error: null,
      }

      set((state) => ({
        sessions: [...state.sessions, session],
        activeSessionId: id,
      }))
    } finally {
      set((state) => {
        const next = { ...state.connectingByConnectionId }
        delete next[connection.id]
        return { connectingByConnectionId: next }
      })
    }
  },

  setActiveSession: (id) => {
    set((state) => {
      if (!state.sessions.some((session) => session.id === id)) return state
      return { activeSessionId: id }
    })
  },

  closeSession: (id) => {
    const target = get().sessions.find((session) => session.id === id)
    if (target) {
      try {
        sftpService.stopReconnect(target.client)
        sshService.disconnect(target.client)
      } catch (error) {
        console.warn('[SFTP] Disconnect failed:', error)
      }
    }

    set((state) => {
      const nextSessions = state.sessions.filter((session) => session.id !== id)
      let nextActiveSessionId = state.activeSessionId

      if (state.activeSessionId === id) {
        nextActiveSessionId =
          nextSessions.length > 0 ? nextSessions[nextSessions.length - 1].id : null
      }

      return {
        sessions: nextSessions,
        activeSessionId: nextActiveSessionId,
      }
    })
  },

  listDirectory: async (path) => {
    const state = get()
    const active = getActiveSession(state)
    if (!active) return

    const targetPath = normalizePath(path ?? active.currentPath)
    set((current) => ({
      sessions: updateSession(current.sessions, active.id, (session) => ({
        ...session,
        loading: true,
        error: null,
      })),
    }))
    try {
      const results = await sftpService.list(active.client, targetPath)
      const files = normalizeEntries(results, targetPath)
      set((current) => ({
        sessions: updateSession(current.sessions, active.id, (session) => ({
          ...session,
          files,
          currentPath: targetPath,
          loading: false,
          connected: true,
          error: null,
        })),
      }))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load directory'
      set((current) => ({
        sessions: updateSession(current.sessions, active.id, (session) => ({
          ...session,
          loading: false,
          error: message,
        })),
      }))
      throw error
    }
  },

  openFolder: async (path) => {
    await get().listDirectory(path)
  },

  goUp: async () => {
    const active = getActiveSession(get())
    if (!active) return
    await get().listDirectory(parentPath(active.currentPath))
  },

  createFolder: async (name, parentPathArg) => {
    const active = getActiveSession(get())
    if (!active) throw new Error('No active SFTP session')
    const parent = normalizePath(parentPathArg ?? active.currentPath)
    const folderPath = resolveRemotePath(parent, name)
    await sftpService.mkdir(active.client, folderPath)
    await get().listDirectory(parent)
  },

  renameEntry: async (oldPath, newNameOrPath) => {
    const active = getActiveSession(get())
    if (!active) throw new Error('No active SFTP session')
    const oldNormalized = normalizePath(oldPath)
    const parent = parentPath(oldNormalized)
    const nextPath = resolveRemotePath(parent, newNameOrPath)
    await sftpService.rename(active.client, oldNormalized, nextPath)
    await get().listDirectory(active.currentPath)
  },

  deleteEntries: async (entries: SftpDeleteTarget[]) => {
    const active = getActiveSession(get())
    if (!active) throw new Error('No active SFTP session')
    if (!entries.length) return

    const removeRecursive = async (path: string, isDirHint?: boolean): Promise<void> => {
      const normalized = normalizePath(path)
      const known = active.files.find((file) => file.path === normalized)
      const isDirectory = isDirHint ?? known?.is_dir ?? false
      if (!isDirectory) {
        await sftpService.removeFile(active.client, normalized)
        return
      }

      const childrenRaw = await sftpService.list(active.client, normalized)
      const children = normalizeEntries(childrenRaw, normalized)
      for (const child of children) {
        await removeRecursive(child.path, child.is_dir)
      }
      await sftpService.removeDirectory(active.client, normalized)
    }

    for (const entry of entries) {
      await removeRecursive(entry.path, entry.isDir)
    }
    await get().listDirectory(active.currentPath)
  },

  copyEntries: async (sourcePaths, destinationDirectory) => {
    const active = getActiveSession(get())
    if (!active) throw new Error('No active SFTP session')
    if (!sourcePaths.length) return

    const destination = normalizePath(destinationDirectory ?? active.currentPath)
    await sftpService.copyRemoteEntries(
      active.client,
      sourcePaths.map((path) => normalizePath(path)),
      destination,
    )
    await get().listDirectory(destination)
  },

  downloadEntries: async (remotePaths, localDirectory) => {
    const active = getActiveSession(get())
    if (!active) throw new Error('No active SFTP session')
    if (!remotePaths.length) return []

    const appDownloadsDir = FileSystem.documentDirectory
      ? `${FileSystem.documentDirectory}freessh-downloads/`
      : null
    const preferredAndroidDownloadsDir = 'file:///storage/emulated/0/Download/freessh-downloads/'
    
    // We try the provided localDirectory first, then the public downloads directory (on Android), then the app's document directory
    let baseDirectory: string | null | undefined = localDirectory
    if (!baseDirectory) {
      if (Platform.OS === 'android') {
        baseDirectory = preferredAndroidDownloadsDir
      } else {
        baseDirectory = appDownloadsDir
      }
    }

    if (!baseDirectory) throw new Error('No writable local directory available')

    console.log('[SFTP] downloadEntries:start', {
      remotePaths,
      localDirectory,
      resolvedBaseDirectory: baseDirectory,
    })

    let writableBaseDirectory = baseDirectory
    try {
      await FileSystem.makeDirectoryAsync(writableBaseDirectory, { intermediates: true })
    } catch (mkdirError) {
      // If public downloads dir is not writable (common on Android), fall back to app internal storage
      if (Platform.OS === 'android' && appDownloadsDir && writableBaseDirectory !== appDownloadsDir) {
        console.warn('[SFTP] downloadEntries:public downloads unavailable, falling back to app storage', {
          requested: writableBaseDirectory,
          fallback: appDownloadsDir,
          mkdirError,
        })
        writableBaseDirectory = appDownloadsDir
        await FileSystem.makeDirectoryAsync(writableBaseDirectory, { intermediates: true })
      } else {
        throw mkdirError
      }
    }

    const downloadedPaths: string[] = []
    for (const remotePath of remotePaths) {
      const name = fileNameFromPath(remotePath) || `download-${Date.now()}`
      const localPath = `${writableBaseDirectory.replace(/\/+$/, '')}/${name}`
      const normalizedRemotePath = normalizePath(remotePath)
      
      console.log('[SFTP] downloadEntries:item', {
        remotePath,
        normalizedRemotePath,
        localPath,
      })

      try {
        await sftpService.downloadFile(active.client, normalizedRemotePath, localPath)
        downloadedPaths.push(localPath)
      } catch (error) {
        console.error('[SFTP] downloadEntries:item failed', {
          remotePath,
          normalizedRemotePath,
          localPath,
          error,
        })
        // If we fail and we are using a public directory, try falling back to app storage for this specific file
        if (writableBaseDirectory !== appDownloadsDir && appDownloadsDir) {
          console.warn('[SFTP] downloadEntries:item failed, retrying in app storage', { localPath, appDownloadsDir })
          const fallbackLocalPath = `${appDownloadsDir.replace(/\/+$/, '')}/${name}`
          try {
            await FileSystem.makeDirectoryAsync(appDownloadsDir, { intermediates: true })
            await sftpService.downloadFile(active.client, normalizedRemotePath, fallbackLocalPath)
            downloadedPaths.push(fallbackLocalPath)
            continue // Succeeded in fallback, move to next file
          } catch (fallbackError) {
            console.error('[SFTP] downloadEntries:item fallback also failed', { fallbackLocalPath, fallbackError })
          }
        }
        throw error
      }
    }
    console.log('[SFTP] downloadEntries:done', { downloadedPaths })
    return downloadedPaths
  },

  uploadFiles: async (localPaths, remoteDirectory) => {
    const active = getActiveSession(get())
    if (!active) throw new Error('No active SFTP session')
    if (!localPaths.length) return

    const remoteBase = normalizePath(remoteDirectory ?? active.currentPath)
    const stagingBase =
      FileSystem.cacheDirectory ?? FileSystem.documentDirectory ?? null
    if (!stagingBase) throw new Error('No writable local directory available for upload staging')
    const stagingDirectory = `${stagingBase.replace(/\/+$/, '')}/sftp-upload-staging/`
    
    console.log('[SFTP] uploadFiles:start', {
      localPaths,
      remoteDirectory,
      resolvedRemoteBase: remoteBase,
      stagingDirectory,
    })
    
    await FileSystem.makeDirectoryAsync(stagingDirectory, { intermediates: true })

    for (const localPath of localPaths) {
      const rawName = fileNameFromPath(localPath)
      if (!rawName) continue
      const safeName = rawName.replace(/[<>:"/\\|?*\u0000-\u001F]/g, '_')
      const remotePath = resolveRemotePath(remoteBase, safeName)
      let uploadSourcePath = localPath
      
      // On mobile, files from external pickers (content://) or other app-private locations 
      // often need to be staged in the app's sandbox before being passed to native modules.
      const shouldStage = localPath.startsWith('content://') || localPath.startsWith('file:///storage/emulated/')
      
      if (shouldStage) {
        const stagedPath = `${stagingDirectory}${Date.now()}-${safeName}`
        console.log('[SFTP] uploadFiles:staging file', { localPath, stagedPath })
        try {
          await FileSystem.copyAsync({ from: localPath, to: stagedPath })
          const stagedInfo = await FileSystem.getInfoAsync(stagedPath)
          if (!stagedInfo.exists) {
            throw new Error(`Failed to stage file: ${localPath}`)
          }
          console.log('[SFTP] uploadFiles:staged file info', { stagedPath, stagedInfo })
          uploadSourcePath = stagedPath
        } catch (stageError) {
          console.error('[SFTP] uploadFiles:staging failed', { localPath, stageError })
          // If staging fails, we try the original path as a last resort
        }
      }

      console.log('[SFTP] uploadFiles:item', {
        localPath,
        rawName,
        safeName,
        uploadSourcePath,
        remotePath,
      })

      try {
        await sftpService.uploadFile(active.client, uploadSourcePath, remotePath)
        
        // Clean up staged file if we created one
        if (uploadSourcePath !== localPath) {
          await FileSystem.deleteAsync(uploadSourcePath, { idempotent: true })
        }
      } catch (error) {
        console.error('[SFTP] uploadFiles:item failed', {
          localPath,
          uploadSourcePath,
          remotePath,
          error,
        })
        throw error
      }
    }
    console.log('[SFTP] uploadFiles:done', { remoteBase })
    await get().listDirectory(remoteBase)
  },

  disconnect: () => {
    const active = getActiveSession(get())
    if (!active) return
    get().closeSession(active.id)
  },

  closeAllSessions: () => {
    const { sessions } = get()
    sessions.forEach((session) => {
      try {
        sftpService.stopReconnect(session.client)
        sshService.disconnect(session.client)
      } catch (error) {
        console.warn('[SFTP] Disconnect failed:', error)
      }
    })
    set({
      sessions: [],
      activeSessionId: null,
    })
  },
}))
