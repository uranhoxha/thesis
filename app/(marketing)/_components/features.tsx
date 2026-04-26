'use client'

import {
  FileText,
  ShoppingCart,
  Timer as TimerIcon,
  ChefHat,
  Share2,
  Palette,
  Save,
  Check,
  Sparkles,
  Mic,
} from 'lucide-react'
import { useMarketingTheme, type MarketingTheme } from './theme-context'
import { cn } from '@/lib/utils'

const swatches: { key: MarketingTheme; label: string; color: string }[] = [
  { key: 'green', label: 'Sage', color: '#4f7d4a' },
  { key: 'red', label: 'Strawberry', color: '#d92c54' },
  { key: 'blue', label: 'Pine', color: '#36656b' },
  { key: 'yellow', label: 'Persimmon', color: '#ff9b2f' },
]

function Kicker({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className=" text-[10px] tracking-[0.22em] uppercase text-[var(--soft)]">
        {n}
      </span>
      <span className="h-px w-8 ink-rule" />
      <span className=" text-[10px] tracking-[0.22em] uppercase text-[var(--soft)]">
        {children}
      </span>
    </div>
  )
}

export function Features() {
  const { theme, setTheme } = useMarketingTheme()

  return (
    <section
      id="features"
      className="relative mx-auto max-w-[1280px] px-6 pb-24 md:px-10 md:pb-32"
    >
      <div className="mb-12 flex items-end justify-between gap-6 md:mb-16">
        <div>
          <span className=" text-[11px] tracking-[0.22em] uppercase text-[var(--soft)]">
            003 — What&apos;s inside
          </span>
          <h2
            className="mt-3 font-display text-[clamp(2.25rem,5vw,3.8rem)] leading-[1] tracking-[-0.02em]"
            style={{ fontFamily: 'var(--font-display), serif' }}
          >
            Eight small things, <span className="italic">done well</span>.
          </h2>
        </div>
        <p className="hidden max-w-xs text-[15px] leading-relaxed text-[var(--ink)]/70 md:block">
          Each tool earns its space on the screen. Nothing is here just to be
          here.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-6 md:gap-5">
        {/* Big card: Recipes editor */}
        <article className="md:col-span-4 group relative overflow-hidden rounded-2xl border border-[var(--rule)] bg-white p-7 md:p-9">
          <Kicker n="01">Editor</Kicker>
          <h3
            className="mt-4 font-display text-[34px] leading-tight tracking-[-0.01em]"
            style={{ fontFamily: 'var(--font-display), serif' }}
          >
            <FileText className="mb-3 inline-block h-7 w-7 text-brand" />
            <br />
            Your recipes, your way.
          </h3>
          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-[var(--ink)]/70">
            A clean, distraction-free editor with autosave. Title, body, done.
            No fields you&apos;ll never fill out, no required photo upload, no
            cooking-time slider you&apos;ll have to fight with.
          </p>

          {/* Mini editor mockup */}
          <div className="mt-7 rounded-xl border border-[var(--rule)] bg-[var(--paper)] p-5">
            <div className="mb-3 flex items-center justify-between">
              <span
                className="font-display text-2xl"
                style={{ fontFamily: 'var(--font-display), serif' }}
              >
                Tomato confit
              </span>
              <span className="inline-flex items-center gap-1  text-[10px] uppercase tracking-wider text-[var(--soft)]">
                <Save className="h-3 w-3" /> saved
              </span>
            </div>
            <pre className="whitespace-pre-wrap font-[Outfit] text-[13.5px] leading-[1.65] text-[var(--ink)]/80">
              {`1 pint cherry tomatoes
1/2 cup olive oil, good
4 garlic cloves, smashed
thyme, a few sprigs
flaky salt

Heat oven 250°F. Combine in a small dish,
make sure tomatoes are mostly submerged.
Roast 90 min until tomatoes have collapsed
and oil is slightly red. Serves 2.`}
            </pre>
          </div>
        </article>

        {/* Buy list card */}
        <article className="md:col-span-2 group relative overflow-hidden rounded-2xl border border-[var(--rule)] bg-white p-7">
          <Kicker n="02">List</Kicker>
          <ShoppingCart className="mt-4 h-6 w-6 text-brand" />
          <h3
            className="mt-3 font-display text-[26px] leading-tight tracking-[-0.01em]"
            style={{ fontFamily: 'var(--font-display), serif' }}
          >
            Smart buy list.
          </h3>
          <p className="mt-2 text-[14px] leading-relaxed text-[var(--ink)]/70">
            Optimistic updates, synced everywhere. Tap once at the store,
            it&apos;s crossed off before the network knows.
          </p>

          <div className="mt-5 space-y-2">
            {[
              { t: 'sourdough loaf', d: true },
              { t: 'unsalted butter', d: true },
              { t: 'maldon salt', d: false },
              { t: 'eggs (1 dozen)', d: false },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2.5 text-[13px]">
                <span
                  className={cn(
                    'flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border',
                    item.d
                      ? 'border-brand bg-brand text-white'
                      : 'border-[var(--rule)] bg-white',
                  )}
                >
                  {item.d && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                </span>
                <span
                  className={item.d ? 'line-through text-[var(--soft)]' : ''}
                >
                  {item.t}
                </span>
              </div>
            ))}
          </div>
        </article>

        {/* Timer */}
        <article className="md:col-span-2 group relative overflow-hidden rounded-2xl border border-[var(--rule)] bg-[var(--ink)] text-[var(--paper)] p-7">
          <div className="flex items-center gap-2">
            <span className=" text-[10px] tracking-[0.22em] uppercase text-[var(--paper)]/60">
              03
            </span>
            <span className="h-px w-8 bg-[var(--paper)]/30" />
            <span className=" text-[10px] tracking-[0.22em] uppercase text-[var(--paper)]/60">
              Timer
            </span>
          </div>
          <TimerIcon className="mt-4 h-6 w-6 text-brand" />
          <h3
            className="mt-3 font-display text-[26px] leading-tight tracking-[-0.01em]"
            style={{ fontFamily: 'var(--font-display), serif' }}
          >
            Right next to <br />
            the recipe.
          </h3>
          <p className="mt-2 text-[14px] leading-relaxed text-[var(--paper)]/70">
            Countdown. Stopwatch. No tab-switching, no phone-fumbling with oily
            hands.
          </p>

          <div className="mt-6 rounded-lg border border-[var(--paper)]/15 bg-[var(--paper)]/5 px-4 py-5">
            <div className="flex items-baseline gap-1  tabular-nums">
              <span className="text-4xl">12</span>
              <span className="text-2xl text-[var(--paper)]/40">:</span>
              <span className="text-4xl">42</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-brand blink" />
              <span className=" text-[10px] tracking-[0.18em] uppercase text-[var(--paper)]/60">
                pasta · al dente
              </span>
            </div>
          </div>
        </article>

        {/* ChefBot daily picks */}
        <article className="md:col-span-2 group relative overflow-hidden rounded-2xl border border-[var(--rule)] bg-white p-7">
          <Kicker n="04">Daily picks</Kicker>
          <ChefHat className="mt-4 h-6 w-6 text-brand" />
          <h3
            className="mt-3 font-display text-[26px] leading-tight tracking-[-0.01em]"
            style={{ fontFamily: 'var(--font-display), serif' }}
          >
            ChefBot picks <br />
            three a day.
          </h3>
          <p className="mt-2 text-[14px] leading-relaxed text-[var(--ink)]/70">
            One savory, one snack, one dessert — chosen for everyone, every day.
            Same picks for everyone. Tomorrow, three new ones.
          </p>

          <div className="mt-5 flex flex-col gap-2">
            {[
              {
                c: 'savory',
                t: 'Miso eggplant',
                cls: 'bg-yellow-50 text-yellow-800 border-yellow-200',
              },
              {
                c: 'snack',
                t: 'Salt-cured radish',
                cls: 'bg-blue-50 text-blue-800 border-blue-200',
              },
              {
                c: 'dessert',
                t: 'Olive oil cake',
                cls: 'bg-pink-50 text-pink-800 border-pink-200',
              },
            ].map((p, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 rounded-lg border border-[var(--rule)] px-3 py-2"
              >
                <span className="text-[13px]">{p.t}</span>
                <span
                  className={cn(
                    'rounded-full border px-2 py-0.5 text-[10px] font-medium',
                    p.cls,
                  )}
                >
                  {p.c}
                </span>
              </div>
            ))}
          </div>
        </article>

        {/* Share */}
        <article className="md:col-span-2 group relative overflow-hidden rounded-2xl border border-[var(--rule)] bg-white p-7">
          <Kicker n="05">Share</Kicker>
          <Share2 className="mt-4 h-6 w-6 text-brand" />
          <h3
            className="mt-3 font-display text-[26px] leading-tight tracking-[-0.01em]"
            style={{ fontFamily: 'var(--font-display), serif' }}
          >
            One link. <br />
            That&apos;s the whole thing.
          </h3>
          <p className="mt-2 text-[14px] leading-relaxed text-[var(--ink)]/70">
            The recipe is compressed straight into the URL. Send it to your mom,
            no account needed to read it.
          </p>

          <div className="mt-5 rounded-lg bg-[var(--paper)] p-3  text-[11px] tracking-tight text-[var(--ink)]/80 break-all">
            cooksmth.app/share?data=
            <span className="text-brand">N4Igxg9gJg…rZ8H</span>
          </div>
        </article>

        {/* Themes — interactive switcher */}
        <article className="md:col-span-2 group relative overflow-hidden rounded-2xl border border-[var(--rule)] bg-white p-7">
          <Kicker n="06">Themes</Kicker>
          <Palette className="mt-4 h-6 w-6 text-brand" />
          <h3
            className="mt-3 font-display text-[26px] leading-tight tracking-[-0.01em]"
            style={{ fontFamily: 'var(--font-display), serif' }}
          >
            Pick a color. <br />
            <span className="italic">Try it.</span>
          </h3>
          <p className="mt-2 text-[14px] leading-relaxed text-[var(--ink)]/70">
            Four moods. Tap a swatch to repaint the entire page — yes, this page
            too.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-2">
            {swatches.map((s) => {
              const active = theme === s.key
              return (
                <button
                  key={s.key}
                  onClick={() => setTheme(s.key)}
                  className={cn(
                    'group/btn flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-all',
                    active
                      ? 'border-brand bg-brand/5'
                      : 'border-[var(--rule)] hover:border-[var(--ink)]/30',
                  )}
                >
                  <span
                    className="h-5 w-5 shrink-0 rounded-full ring-1 ring-inset ring-black/10"
                    style={{ background: s.color }}
                  />
                  <span className="flex flex-col">
                    <span className="text-[12px] font-medium">{s.label}</span>
                    <span className=" text-[9px] tracking-wider uppercase text-[var(--soft)]">
                      {active ? 'live' : s.key}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </article>

        {/* AI / Pantry → plate */}
        <article className="md:col-span-2 group relative overflow-hidden rounded-2xl border border-[var(--rule)] bg-white p-7">
          <Kicker n="07">AI</Kicker>
          <Sparkles className="mt-4 h-6 w-6 text-brand" />
          <h3
            className="mt-3 font-display text-[26px] leading-tight tracking-[-0.01em]"
            style={{ fontFamily: 'var(--font-display), serif' }}
          >
            Tell it what you <br />
            <span className="italic">have</span>.
          </h3>
          <p className="mt-2 text-[14px] leading-relaxed text-[var(--ink)]/70">
            Drop in your ingredients. ChefBot writes three recipes you can
            actually make tonight — not a Pinterest board.
          </p>

          <div className="mt-5 rounded-lg border border-[var(--rule)] bg-[var(--paper)] p-3">
            <div className="flex flex-wrap gap-1.5">
              {['eggs', 'spinach', 'feta', 'lemon', 'bread'].map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-[var(--rule)] bg-white px-2 py-0.5 text-[11px] text-[var(--ink)]/70"
                >
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 text-[10px] tracking-[0.18em] uppercase text-[var(--soft)]">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
              3 recipes →
            </div>
          </div>
        </article>

        {/* Voice / Hands-free */}
        <article className="md:col-span-2 group relative overflow-hidden rounded-2xl border border-[var(--rule)] bg-white p-7">
          <Kicker n="08">Voice</Kicker>
          <Mic className="mt-4 h-6 w-6 text-brand" />
          <h3
            className="mt-3 font-display text-[26px] leading-tight tracking-[-0.01em]"
            style={{ fontFamily: 'var(--font-display), serif' }}
          >
            Hands covered <br />
            in dough?
          </h3>
          <p className="mt-2 text-[14px] leading-relaxed text-[var(--ink)]/70">
            &quot;Next step.&quot; &quot;Set a 7-minute timer.&quot; &quot;Repeat
            that.&quot; The recipe listens.
          </p>

          <div className="mt-5 space-y-2">
            {['Next step', 'Set a 7-minute timer', 'Repeat that'].map(
              (t, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-lg border border-[var(--rule)] bg-[var(--paper)] px-3 py-2 text-[12px] text-[var(--ink)]/80"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-brand blink" />
                  &quot;{t}&quot;
                </div>
              ),
            )}
          </div>
        </article>
      </div>
    </section>
  )
}
