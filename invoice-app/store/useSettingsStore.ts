import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
  currency: string
  companyName: string | null
  setCurrency: (currency: string) => void
  setSettings: (settings: { currency: string, companyName: string | null }) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      currency: 'USD',
      companyName: null,
      setCurrency: (currency) => set({ currency }),
      setSettings: (settings) => set(settings),
    }),
    {
      name: 'settings-storage',
    }
  )
)
