'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
} from 'react'

export type ThemeType = 'green' | 'red' | 'blue' | 'yellow'

const THEME_KEY = 'app-theme'
const AI_DISABLED_KEY = 'app-ai-disabled'

interface SettingsContextType {
  theme: ThemeType
  setTheme: (theme: ThemeType) => void
  aiDisabled: boolean
  setAiDisabled: (value: boolean) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback)
  return () => window.removeEventListener('storage', callback)
}

function getThemeSnapshot(): ThemeType {
  return (localStorage.getItem(THEME_KEY) as ThemeType) || 'green'
}

function getAiSnapshot(): boolean {
  return localStorage.getItem(AI_DISABLED_KEY) === 'true'
}

const getServerThemeSnapshot = (): ThemeType => 'green'
const getServerAiSnapshot = (): boolean => false

function notify(key: string, value: string) {
  window.dispatchEvent(new StorageEvent('storage', { key, newValue: value }))
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(
    subscribe,
    getThemeSnapshot,
    getServerThemeSnapshot,
  )
  const aiDisabled = useSyncExternalStore(
    subscribe,
    getAiSnapshot,
    getServerAiSnapshot,
  )

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('theme-red', 'theme-blue', 'theme-yellow')
    if (theme !== 'green') {
      root.classList.add(`theme-${theme}`)
    }
  }, [theme])

  const setTheme = (newTheme: ThemeType) => {
    localStorage.setItem(THEME_KEY, newTheme)
    notify(THEME_KEY, newTheme)
  }

  const setAiDisabled = (value: boolean) => {
    const stored = value ? 'true' : 'false'
    localStorage.setItem(AI_DISABLED_KEY, stored)
    notify(AI_DISABLED_KEY, stored)
  }

  return (
    <SettingsContext.Provider
      value={{ theme, setTheme, aiDisabled, setAiDisabled }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a ThemeProvider')
  }
  return context
}
