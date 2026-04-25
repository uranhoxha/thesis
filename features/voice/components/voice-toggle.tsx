'use client'

import { Mic, MicOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useVoice } from '../providers/voice-provider'

export function VoiceToggle() {
  const { supported, isListening, toggle, flash, flashKind, error } = useVoice()

  if (!supported) {
    return (
      <button
        type="button"
        disabled
        title="Voice control not supported in this browser"
        className="h-10 w-10 rounded-full border border-border bg-white text-gray-300 flex items-center justify-center cursor-not-allowed"
      >
        <MicOff className="w-5 h-5" />
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggle}
        title={isListening ? 'Voice on — click to turn off' : 'Turn on voice'}
        aria-pressed={isListening}
        className={cn(
          'relative h-10 w-10 rounded-full flex items-center justify-center transition-all cursor-pointer',
          isListening
            ? 'bg-brand text-white shadow-md'
            : 'bg-white border border-border text-gray-500 hover:bg-gray-50',
        )}
      >
        <Mic className="w-5 h-5 relative z-10" />
        {isListening && (
          <>
            <span className="absolute inset-0 rounded-full ring-2 ring-brand/60 animate-ping" />
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white" />
          </>
        )}
      </button>

      {(isListening || error) && (
        <div
          className={cn(
            'absolute top-12 right-0 z-50 px-3 py-2 rounded-lg text-sm shadow-md border max-w-xs',
            error
              ? 'bg-red-50 border-red-200 text-red-700'
              : flashKind === 'error'
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : flashKind === 'success'
                  ? 'bg-brand/10 border-brand/30 text-brand'
                  : 'bg-white border-border text-gray-600',
          )}
        >
          {error ? (
            <span>{error}</span>
          ) : (
            <span className="whitespace-nowrap">
              {flash || (
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
                  Listening…
                </span>
              )}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
