import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import {
  buildTerminalKeyboardCustomization,
  getDefaultTerminalKeyboardCustomization,
  type TerminalKeyboardCustomization,
  type TerminalKeyboardCustomizationPresetId,
  type TerminalKeyboardKey,
  type TerminalKeyboardPresetId,
  type TerminalKeyboardRow,
  type TerminalKeyboardSettings,
} from '@/services/terminal'

type TerminalKeyboardState = {
  config: TerminalKeyboardCustomization
  setPreset: (presetId: TerminalKeyboardPresetId) => void
  addPinnedKey: (key: TerminalKeyboardKey) => void
  removePinnedKey: (keyId: string) => void
  reorderPinnedKeys: (keys: TerminalKeyboardKey[]) => void
  addTopBarKey: (key: TerminalKeyboardKey) => void
  removeTopBarKey: (keyId: string) => void
  reorderTopBarKeys: (keys: TerminalKeyboardKey[]) => void
  addRow: (row: TerminalKeyboardRow) => void
  removeRow: (rowId: string) => void
  reorderRows: (rows: TerminalKeyboardRow[]) => void
  updateRow: (rowId: string, updates: Partial<TerminalKeyboardRow>) => void
  toggleRowVisibility: (rowId: string) => void
  addKeyToRow: (rowId: string, key: TerminalKeyboardKey) => void
  removeKeyFromRow: (rowId: string, keyId: string) => void
  reorderKeysInRow: (rowId: string, keys: TerminalKeyboardKey[]) => void
  updateSettings: (settings: Partial<TerminalKeyboardSettings>) => void
  resetToDefault: () => void
  resetTopBar: () => void
  resetFullKeyboard: () => void
}

const cloneKey = (key: TerminalKeyboardKey): TerminalKeyboardKey => ({ ...key })

const cloneRow = (row: TerminalKeyboardRow): TerminalKeyboardRow => ({
  ...row,
  keys: row.keys.map(cloneKey),
})

const cloneCustomization = (
  config: TerminalKeyboardCustomization,
): TerminalKeyboardCustomization => ({
  ...config,
  topBar: {
    pinnedKeys: config.topBar.pinnedKeys.map(cloneKey),
    keys: config.topBar.keys.map(cloneKey),
  },
  fullKeyboard: {
    rows: config.fullKeyboard.rows.map(cloneRow),
  },
  settings: { ...config.settings },
})

const markCustom = (
  config: TerminalKeyboardCustomization,
): TerminalKeyboardCustomization => ({
  ...cloneCustomization(config),
  preset: 'custom' as TerminalKeyboardCustomizationPresetId,
})

export const useTerminalKeyboardStore = create<TerminalKeyboardState>()(
  persist(
    (set) => ({
      config: getDefaultTerminalKeyboardCustomization(),

      setPreset: (presetId) =>
        set((state) => ({
          config: buildTerminalKeyboardCustomization(presetId, state.config.settings),
        })),

      addPinnedKey: (key) =>
        set((state) => ({
          config: markCustom({
            ...state.config,
            topBar: {
              ...state.config.topBar,
              pinnedKeys: [...state.config.topBar.pinnedKeys, cloneKey(key)],
            },
          }),
        })),

      removePinnedKey: (keyId) =>
        set((state) => ({
          config: markCustom({
            ...state.config,
            topBar: {
              ...state.config.topBar,
              pinnedKeys: state.config.topBar.pinnedKeys.filter((key) => key.id !== keyId),
            },
          }),
        })),

      reorderPinnedKeys: (keys) =>
        set((state) => ({
          config: markCustom({
            ...state.config,
            topBar: {
              ...state.config.topBar,
              pinnedKeys: keys.map(cloneKey),
            },
          }),
        })),

      addTopBarKey: (key) =>
        set((state) => ({
          config: markCustom({
            ...state.config,
            topBar: {
              ...state.config.topBar,
              keys: [...state.config.topBar.keys, cloneKey(key)],
            },
          }),
        })),

      removeTopBarKey: (keyId) =>
        set((state) => ({
          config: markCustom({
            ...state.config,
            topBar: {
              ...state.config.topBar,
              keys: state.config.topBar.keys.filter((key) => key.id !== keyId),
            },
          }),
        })),

      reorderTopBarKeys: (keys) =>
        set((state) => ({
          config: markCustom({
            ...state.config,
            topBar: {
              ...state.config.topBar,
              keys: keys.map(cloneKey),
            },
          }),
        })),

      addRow: (row) =>
        set((state) => ({
          config: markCustom({
            ...state.config,
            fullKeyboard: {
              rows: [...state.config.fullKeyboard.rows, cloneRow(row)],
            },
          }),
        })),

      removeRow: (rowId) =>
        set((state) => ({
          config: markCustom({
            ...state.config,
            fullKeyboard: {
              rows: state.config.fullKeyboard.rows.filter((row) => row.id !== rowId),
            },
          }),
        })),

      reorderRows: (rows) =>
        set((state) => ({
          config: markCustom({
            ...state.config,
            fullKeyboard: {
              rows: rows.map(cloneRow),
            },
          }),
        })),

      updateRow: (rowId, updates) =>
        set((state) => ({
          config: markCustom({
            ...state.config,
            fullKeyboard: {
              rows: state.config.fullKeyboard.rows.map((row) =>
                row.id === rowId
                  ? {
                      ...row,
                      ...updates,
                      keys: updates.keys ? updates.keys.map(cloneKey) : row.keys.map(cloneKey),
                    }
                  : cloneRow(row),
              ),
            },
          }),
        })),

      toggleRowVisibility: (rowId) =>
        set((state) => ({
          config: markCustom({
            ...state.config,
            fullKeyboard: {
              rows: state.config.fullKeyboard.rows.map((row) =>
                row.id === rowId
                  ? {
                      ...row,
                      visible: !(row.visible ?? true),
                      keys: row.keys.map(cloneKey),
                    }
                  : cloneRow(row),
              ),
            },
          }),
        })),

      addKeyToRow: (rowId, key) =>
        set((state) => ({
          config: markCustom({
            ...state.config,
            fullKeyboard: {
              rows: state.config.fullKeyboard.rows.map((row) =>
                row.id === rowId
                  ? { ...row, keys: [...row.keys.map(cloneKey), cloneKey(key)] }
                  : cloneRow(row),
              ),
            },
          }),
        })),

      removeKeyFromRow: (rowId, keyId) =>
        set((state) => ({
          config: markCustom({
            ...state.config,
            fullKeyboard: {
              rows: state.config.fullKeyboard.rows.map((row) =>
                row.id === rowId
                  ? {
                      ...row,
                      keys: row.keys.filter((key) => key.id !== keyId).map(cloneKey),
                    }
                  : cloneRow(row),
              ),
            },
          }),
        })),

      reorderKeysInRow: (rowId, keys) =>
        set((state) => ({
          config: markCustom({
            ...state.config,
            fullKeyboard: {
              rows: state.config.fullKeyboard.rows.map((row) =>
                row.id === rowId ? { ...row, keys: keys.map(cloneKey) } : cloneRow(row),
              ),
            },
          }),
        })),

      updateSettings: (settings) =>
        set((state) => ({
          config: {
            ...cloneCustomization(state.config),
            settings: {
              ...state.config.settings,
              ...settings,
            },
          },
        })),

      resetToDefault: () => set({ config: getDefaultTerminalKeyboardCustomization() }),

      resetTopBar: () =>
        set((state) => {
          const presetId =
            state.config.preset === 'custom' ? 'default' : (state.config.preset as TerminalKeyboardPresetId)
          const presetConfig = buildTerminalKeyboardCustomization(presetId, state.config.settings)

          return {
            config: {
              ...cloneCustomization(state.config),
              topBar: presetConfig.topBar,
            },
          }
        }),

      resetFullKeyboard: () =>
        set((state) => {
          const presetId =
            state.config.preset === 'custom' ? 'default' : (state.config.preset as TerminalKeyboardPresetId)
          const presetConfig = buildTerminalKeyboardCustomization(presetId, state.config.settings)

          return {
            config: {
              ...cloneCustomization(state.config),
              fullKeyboard: presetConfig.fullKeyboard,
            },
          }
        }),
    }),
    {
      name: 'terminal-keyboard-storage',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    }
  )
)
