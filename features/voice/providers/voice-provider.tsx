'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useTimerContext } from '@/features/timer/providers/timer-provider'
import {
  addBuyItem,
  deleteBuyItem,
  toggleBuyItem,
} from '@/features/buy-list/api/buy-list'
import { Item } from '@/features/buy-list/types/buy-items'
import { useVoiceRecognition } from '../hooks/use-voice-recognition'
import { useSpeechSynthesis } from '../hooks/use-speech-synthesis'
import { useWakeLock } from '../hooks/use-wake-lock'
import { parseCommand } from '../lib/parse-command'

type StatusKind = 'idle' | 'listening' | 'success' | 'error'

interface VoiceContextValue {
  supported: boolean
  isListening: boolean
  toggle: () => void
  flash: string | null
  flashKind: StatusKind
  error: string | null
}

const VoiceContext = createContext<VoiceContextValue | undefined>(undefined)

export function VoiceProvider({ children }: { children: React.ReactNode }) {
  const [isListening, setIsListening] = useState(false)
  const [flash, setFlash] = useState<string | null>(null)
  const [flashKind, setFlashKind] = useState<StatusKind>('idle')
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const timer = useTimerContext()
  const queryClient = useQueryClient()
  const { speak, speaking } = useSpeechSynthesis()

  useWakeLock(isListening)

  const showFlash = useCallback(
    (msg: string, kind: StatusKind, durationMs = 3000) => {
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current)
      setFlash(msg)
      setFlashKind(kind)
      flashTimerRef.current = setTimeout(() => {
        setFlash(null)
        setFlashKind('idle')
      }, durationMs)
    },
    [],
  )

  const handleTranscript = useCallback(
    async (transcript: string) => {
      const cmd = parseCommand(transcript)

      switch (cmd.kind) {
        case 'voice-off':
          speak('Voice off')
          setIsListening(false)
          return
        case 'start-timer':
          timer.handleStart()
          speak('Timer started')
          showFlash('Timer started', 'success')
          return
        case 'stop-timer':
          timer.handleStop()
          speak('Paused')
          showFlash('Paused', 'success')
          return
        case 'reset-timer':
          timer.handleReset()
          speak('Reset')
          showFlash('Reset', 'success')
          return
        case 'set-timer':
          timer.setMode('countdown')
          timer.setIsRunning(false)
          timer.setTime(cmd.ms)
          setTimeout(() => timer.setIsRunning(true), 60)
          speak(`${cmd.label} timer started`)
          showFlash(`${cmd.label} timer started`, 'success')
          return
        case 'set-timer-mode':
          timer.setMode(cmd.mode)
          timer.setIsRunning(false)
          timer.setTime(0)
          speak(`${cmd.mode} mode`)
          showFlash(
            `Switched to ${cmd.mode === 'countdown' ? 'countdown' : 'stopwatch'}`,
            'success',
          )
          return
        case 'add-buy-item':
          try {
            await addBuyItem(cmd.title)
            await queryClient.invalidateQueries({ queryKey: ['buy-items'] })
            speak(`Added ${cmd.title}`)
            showFlash(`Added ${cmd.title}`, 'success')
          } catch {
            speak('Could not add item')
            showFlash('Could not add item', 'error')
          }
          return
        case 'check-buy-item': {
          const items =
            queryClient.getQueryData<Item[]>(['buy-items']) || []
          const target = cmd.title.toLowerCase()
          const matches = items.filter((i) =>
            i.title.toLowerCase().includes(target),
          )
          if (matches.length === 0) {
            speak(`I don't see ${cmd.title} on the list`)
            showFlash(`No match for "${cmd.title}"`, 'error')
          } else if (matches.length > 1) {
            speak('Multiple matches. Be more specific.')
            showFlash('Multiple matches', 'error')
          } else {
            const item = matches[0]
            if (item.checked === cmd.checked) {
              speak(
                `${item.title} is already ${cmd.checked ? 'checked' : 'unchecked'}`,
              )
              showFlash(
                `${item.title} already ${cmd.checked ? 'checked' : 'unchecked'}`,
                'success',
              )
            } else {
              try {
                await toggleBuyItem(item.id, cmd.checked)
                await queryClient.invalidateQueries({
                  queryKey: ['buy-items'],
                })
                speak(
                  `${cmd.checked ? 'Checked' : 'Unchecked'} ${item.title}`,
                )
                showFlash(
                  `${cmd.checked ? 'Checked' : 'Unchecked'} ${item.title}`,
                  'success',
                )
              } catch {
                speak('Could not update item')
                showFlash('Could not update', 'error')
              }
            }
          }
          return
        }
        case 'remove-buy-item': {
          const items =
            queryClient.getQueryData<Item[]>(['buy-items']) || []
          const target = cmd.title.toLowerCase()
          const matches = items.filter((i) =>
            i.title.toLowerCase().includes(target),
          )
          if (matches.length === 0) {
            speak(`I don't see ${cmd.title} on the list`)
            showFlash(`No match for "${cmd.title}"`, 'error')
          } else if (matches.length > 1) {
            speak('Multiple matches. Be more specific.')
            showFlash('Multiple matches', 'error')
          } else {
            try {
              await deleteBuyItem(matches[0].id)
              await queryClient.invalidateQueries({ queryKey: ['buy-items'] })
              speak(`Removed ${matches[0].title}`)
              showFlash(`Removed ${matches[0].title}`, 'success')
            } catch {
              speak('Could not remove')
              showFlash('Could not remove', 'error')
            }
          }
          return
        }
        case 'list-buy-items': {
          const items =
            queryClient.getQueryData<Item[]>(['buy-items']) || []
          if (items.length === 0) {
            speak('Your list is empty')
            showFlash('List is empty', 'success')
          } else {
            const names = items.map((i) => i.title).join(', ')
            speak(`On your list: ${names}`)
            showFlash(`Read ${items.length} item${items.length === 1 ? '' : 's'}`, 'success')
          }
          return
        }
        case 'unrecognized':
          return
      }
    },
    [timer, speak, queryClient, showFlash],
  )

  const handleFatalError = useCallback(() => {
    setIsListening(false)
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current)
    setFlash(null)
    setFlashKind('idle')
  }, [])

  const { supported, error } = useVoiceRecognition({
    enabled: isListening,
    paused: speaking,
    onTranscript: handleTranscript,
    onFatalError: handleFatalError,
  })

  const toggle = useCallback(() => {
    setIsListening((prev) => {
      const next = !prev
      if (next) {
        showFlash('Listening…', 'listening', 60_000)
        speak('Voice on')
      } else {
        if (flashTimerRef.current) clearTimeout(flashTimerRef.current)
        setFlash(null)
        setFlashKind('idle')
        speak('Voice off')
      }
      return next
    })
  }, [speak, showFlash])

  return (
    <VoiceContext.Provider
      value={{ supported, isListening, toggle, flash, flashKind, error }}
    >
      {children}
    </VoiceContext.Provider>
  )
}

export function useVoice() {
  const ctx = useContext(VoiceContext)
  if (!ctx) {
    throw new Error('useVoice must be used within a VoiceProvider')
  }
  return ctx
}
