'use client'

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react'

export type MarketingTheme = 'green' | 'red' | 'blue' | 'yellow'

const Ctx = createContext<{
  theme: MarketingTheme
  setTheme: (t: MarketingTheme) => void
} | null>(null)

export function MarketingThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<MarketingTheme>('green')
  const className = theme === 'green' ? '' : `theme-${theme}`
  return (
    <Ctx.Provider value={{ theme, setTheme }}>
      <div data-marketing className={className}>
        {children}
      </div>
    </Ctx.Provider>
  )
}

export function useMarketingTheme() {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('useMarketingTheme must be used inside MarketingThemeProvider')
  return ctx
}
