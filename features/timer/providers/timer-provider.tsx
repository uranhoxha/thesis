'use client'

import React, { createContext, useContext } from 'react'
import { useTimer } from '../hooks/use-hooks'

type TimerValue = ReturnType<typeof useTimer>

const TimerContext = createContext<TimerValue | undefined>(undefined)

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const value = useTimer()
  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>
}

export function useTimerContext() {
  const ctx = useContext(TimerContext)
  if (!ctx) {
    throw new Error('useTimerContext must be used within a TimerProvider')
  }
  return ctx
}
