'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Check, Sparkles } from 'lucide-react'
import { useSettings, ThemeType } from '../hooks/use-theme'
import { cn } from '@/lib/utils'

const themes: {
  name: string
  value: ThemeType
  color: string
  hint?: string
}[] = [
  { name: 'Green', value: 'green', color: '#25671E', hint: 'Default' },
  { name: 'Red', value: 'red', color: '#D92C54' },
  { name: 'Blue', value: 'blue', color: '#36656B' },
  { name: 'Yellow', value: 'yellow', color: '#FF9B2F' },
]

export function SettingsModal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const { theme, setTheme, aiDisabled, setAiDisabled } = useSettings()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-2">
          <section className="flex flex-col gap-3">
            <div>
              <h4 className="text-sm font-medium">Theme color</h4>
              <p className="text-xs text-gray-500 mt-0.5">
                Pick the accent color used across the app.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {themes.map((t) => {
                const selected = theme === t.value
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setTheme(t.value)}
                    aria-pressed={selected}
                    className={cn(
                      'relative flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left cursor-pointer',
                      selected
                        ? 'border-brand bg-brand/5'
                        : 'border-border hover:bg-gray-50',
                    )}
                  >
                    <div className="flex flex-col gap-1 shrink-0">
                      <div
                        className="h-8 w-12 rounded-md shadow-sm"
                        style={{ backgroundColor: t.color }}
                      />
                      <div className="flex gap-1">
                        <div
                          className="h-2 w-6 rounded-full"
                          style={{ backgroundColor: t.color, opacity: 0.6 }}
                        />
                        <div
                          className="h-2 w-4 rounded-full"
                          style={{ backgroundColor: t.color, opacity: 0.3 }}
                        />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{t.name}</p>
                      {t.hint && (
                        <p className="text-xs text-gray-400">{t.hint}</p>
                      )}
                    </div>
                    {selected && (
                      <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-brand text-white flex items-center justify-center">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </section>

          <div className="border-t border-border" />

          <section className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-lg bg-brand/10 text-brand flex items-center justify-center shrink-0">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-medium">Disable AI features</h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Hides Pantry Scan and any other AI-powered tools.
                </p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={aiDisabled}
              onClick={() => setAiDisabled(!aiDisabled)}
              className={cn(
                'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors',
                aiDisabled ? 'bg-brand' : 'bg-gray-200',
              )}
            >
              <span
                className={cn(
                  'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition translate-y-0.5',
                  aiDisabled ? 'translate-x-5' : 'translate-x-0.5',
                )}
              />
            </button>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}
