'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

type SpeechRecognitionEventLike = {
  results: ArrayLike<ArrayLike<{ transcript: string }>>
}
type SpeechRecognitionErrorEventLike = { error?: string }
type SpeechRecognitionInstance = {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null
  onend: (() => void) | null
}
type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance

function getCtor(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
  return w.SpeechRecognition || w.webkitSpeechRecognition || null
}

const noopSubscribe = () => () => {}
const getSupportedSnapshot = () => getCtor() !== null
const getServerSupportedSnapshot = () => false

const FATAL_ERRORS = new Set([
  'network',
  'not-allowed',
  'service-not-allowed',
  'audio-capture',
  'language-not-supported',
])

function describeError(code: string): string {
  switch (code) {
    case 'network':
      return 'Speech service unreachable. On Linux Chromium this often fails — try Google Chrome or Edge.'
    case 'not-allowed':
    case 'service-not-allowed':
      return 'Microphone permission denied.'
    case 'audio-capture':
      return 'No microphone found.'
    case 'language-not-supported':
      return 'Language not supported.'
    default:
      return code
  }
}

export function useVoiceRecognition({
  enabled,
  paused,
  onTranscript,
  onFatalError,
}: {
  enabled: boolean
  paused: boolean
  onTranscript: (transcript: string) => void
  onFatalError?: () => void
}) {
  const supported = useSyncExternalStore(
    noopSubscribe,
    getSupportedSnapshot,
    getServerSupportedSnapshot,
  )
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const onTranscriptRef = useRef(onTranscript)
  const onFatalErrorRef = useRef(onFatalError)
  const shouldRunRef = useRef(false)

  useEffect(() => {
    onTranscriptRef.current = onTranscript
  }, [onTranscript])

  useEffect(() => {
    onFatalErrorRef.current = onFatalError
  }, [onFatalError])

  useEffect(() => {
    if (!supported) return
    const Ctor = getCtor()
    if (!Ctor) return
    const r = new Ctor()
    r.continuous = true
    r.interimResults = false
    r.lang = 'en-US'
    r.onresult = (event) => {
      const results = event.results
      const last = results[results.length - 1]
      const alt = last?.[0]
      if (alt) {
        const transcript = String(alt.transcript).trim()
        if (transcript) onTranscriptRef.current(transcript)
      }
    }
    r.onerror = (event) => {
      const code = String(event?.error || 'unknown')
      if (code === 'no-speech' || code === 'aborted') return
      if (FATAL_ERRORS.has(code)) {
        shouldRunRef.current = false
        setError(describeError(code))
        onFatalErrorRef.current?.()
        return
      }
      setError(describeError(code))
    }
    r.onend = () => {
      if (shouldRunRef.current) {
        try {
          r.start()
        } catch {
          /* already running or transitioning */
        }
      }
    }
    recognitionRef.current = r
    return () => {
      shouldRunRef.current = false
      try {
        r.abort()
      } catch {
        /* ignore */
      }
      recognitionRef.current = null
    }
  }, [supported])

  useEffect(() => {
    if (!supported) return
    const r = recognitionRef.current
    if (!r) return
    const shouldRun = enabled && !paused
    shouldRunRef.current = shouldRun
    if (shouldRun) {
      setError(null)
      try {
        r.start()
      } catch {
        /* may already be started */
      }
    } else {
      try {
        r.stop()
      } catch {
        /* may already be stopped */
      }
    }
  }, [enabled, paused, supported])

  return { supported, error }
}
