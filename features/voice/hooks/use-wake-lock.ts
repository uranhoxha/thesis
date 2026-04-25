'use client'

import { useEffect, useRef } from 'react'

type WakeLockSentinelLike = {
  release(): Promise<void>
  addEventListener(type: 'release', listener: () => void): void
}

type NavigatorWithWakeLock = Navigator & {
  wakeLock?: { request(type: 'screen'): Promise<WakeLockSentinelLike> }
}

export function useWakeLock(active: boolean) {
  const lockRef = useRef<WakeLockSentinelLike | null>(null)

  useEffect(() => {
    if (!active) return
    if (typeof navigator === 'undefined') return
    const nav = navigator as NavigatorWithWakeLock
    if (!nav.wakeLock) return

    let cancelled = false

    const acquire = async () => {
      try {
        const lock = await nav.wakeLock!.request('screen')
        if (cancelled) {
          lock.release().catch(() => {})
          return
        }
        lockRef.current = lock
        lock.addEventListener('release', () => {
          if (lockRef.current === lock) lockRef.current = null
        })
      } catch {
        /* best-effort; ignore */
      }
    }

    const onVisibility = () => {
      if (
        document.visibilityState === 'visible' &&
        active &&
        !lockRef.current
      ) {
        acquire()
      }
    }

    acquire()
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisibility)
      if (lockRef.current) {
        lockRef.current.release().catch(() => {})
        lockRef.current = null
      }
    }
  }, [active])
}
