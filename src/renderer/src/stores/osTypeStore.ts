import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface OSTypeStore {
  osTypes: Record<string, string> // connectionId -> osType
  setOSType: (connectionId: string, osType: string) => void
  getOSType: (connectionId: string) => string | undefined
}

export const useOSTypeStore = create<OSTypeStore>()(
  persist(
    (set, get) => ({
      osTypes: {},
      setOSType: (connectionId, osType) =>
        set((state) => ({
          osTypes: { ...state.osTypes, [connectionId]: osType }
        })),
      getOSType: (connectionId) => get().osTypes[connectionId]
    }),
    {
      name: 'os-type-cache'
    }
  )
)
