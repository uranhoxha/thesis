'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Check, ChefHat } from 'lucide-react'
import { useMarketingTheme } from './theme-context'

import GreenLogo from '@/public/green_logo.svg'
import RedLogo from '@/public/red_logo.svg'
import BlueLogo from '@/public/blue_logo.svg'
import YellowLogo from '@/public/yellow_logo.svg'

const logos = {
  green: GreenLogo,
  red: RedLogo,
  blue: BlueLogo,
  yellow: YellowLogo,
}

export function Hero() {
  const { theme } = useMarketingTheme()

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 grid-paper opacity-40 pointer-events-none" />

      <div className="relative mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-12 px-6 pt-16 pb-24 md:grid-cols-12 md:gap-10 md:px-10 md:pt-24 md:pb-32">
        {/* Left: copy */}
        <div className="md:col-span-7 rise" style={{ animationDelay: '60ms' }}>
          <div className="flex items-center gap-3 mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-brand blink" />
            <span className=" text-[11px] tracking-[0.22em] uppercase text-[var(--soft)]">
              001 — A recipe app, but quiet
            </span>
          </div>

          <h1
            className="font-display leading-[0.95] text-[clamp(2.75rem,7.5vw,5.75rem)] tracking-[-0.02em]"
            style={{
              fontFamily: 'var(--font-display), Times New Roman, serif',
            }}
          >
            Cook from your <span className="italic text-brand">notebook</span>,
            <br className="hidden sm:block" /> not your{' '}
            <span className="relative inline-block">
              feed.
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 200 12"
                preserveAspectRatio="none"
                aria-hidden
              >
                <path
                  d="M2 8 C 50 2, 120 12, 198 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  className="text-brand"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p className="mt-8 max-w-xl text-lg leading-relaxed text-[var(--ink)]/80">
            Cooksmth is a clean, opinionated tool for the people who actually
            cook. Write recipes the way you&apos;d jot them on a napkin, keep a
            shopping list that just works, and never miss a timer again — all in
            one calm window.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 rounded-md bg-brand px-6 py-3 text-[15px] font-medium text-white shadow-sm transition-all hover:bg-brand/90 hover:shadow-md"
            >
              Get started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-md border border-[var(--rule)] bg-white px-6 py-3 text-[15px] font-medium text-[var(--ink)] transition-all hover:border-brand hover:text-brand"
            >
              Sign in
            </Link>
          </div>

          <p className="mt-6  text-[11px] tracking-[0.18em] uppercase text-[var(--soft)]">
            no ads · no scoring · no infinite scroll
          </p>
        </div>

        {/* Right: mascot collage */}
        <div className="md:col-span-5 relative h-[420px] sm:h-[480px] md:h-[560px]">
          {/* Plate */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] sm:h-[360px] sm:w-[360px] md:h-[420px] md:w-[420px] rounded-full bg-white border border-[var(--rule)] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.18)]"
            aria-hidden
          />
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[220px] w-[220px] sm:h-[270px] sm:w-[270px] md:h-[320px] md:w-[320px] rounded-full border border-dashed border-[var(--rule)]"
            aria-hidden
          />

          {/* Mascot */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bob">
            <Image
              src={logos[theme]}
              alt="Cooksmth mascot"
              priority
              className="w-[200px] sm:w-[240px] md:w-[280px] h-auto"
            />
          </div>

          {/* Floating: today's pick card */}
          <div
            className="absolute right-2 top-6 sm:right-4 sm:top-8 md:right-0 md:top-4 w-[220px] -rotate-3 rounded-xl border border-[var(--rule)] bg-white p-4 shadow-[0_18px_40px_-20px_rgba(0,0,0,0.18)] rise"
            style={{ animationDelay: '300ms' }}
          >
            <div className="flex items-center gap-2">
              <ChefHat className="h-4 w-4 text-brand" />
              <span className=" text-[10px] tracking-[0.18em] uppercase text-[var(--soft)]">
                Today&apos;s pick
              </span>
            </div>
            <p
              className="mt-2 font-display text-[22px] leading-tight"
              style={{ fontFamily: 'var(--font-display), serif' }}
            >
              Lemon orzo with charred scallions
            </p>
            <span className="mt-3 inline-block rounded-full bg-yellow-50 border border-yellow-200 px-2 py-0.5 text-[10px] font-medium text-yellow-800">
              savory
            </span>
          </div>

          {/* Floating: buy list mini */}
          <div
            className="absolute left-0 bottom-4 sm:left-2 sm:bottom-6 md:left-0 md:bottom-12 w-[210px] rotate-2 rounded-xl border border-[var(--rule)] bg-white p-3 shadow-[0_18px_40px_-20px_rgba(0,0,0,0.18)] rise"
            style={{ animationDelay: '460ms' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className=" text-[10px] tracking-[0.18em] uppercase text-[var(--soft)]">
                To-buy
              </span>
              <span className="ml-auto  text-[10px] text-[var(--soft)]">
                3 / 5
              </span>
            </div>
            <ul className="space-y-1.5 text-sm">
              {[
                { t: 'orzo', d: true },
                { t: 'scallions', d: true },
                { t: 'lemons (2)', d: true },
                { t: 'parmesan', d: false },
                { t: 'flat-leaf parsley', d: false },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span
                    className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border ${
                      item.d
                        ? 'border-brand bg-brand text-white'
                        : 'border-[var(--rule)] bg-white'
                    }`}
                  >
                    {item.d && (
                      <Check className="h-2.5 w-2.5" strokeWidth={3} />
                    )}
                  </span>
                  <span
                    className={item.d ? 'line-through text-[var(--soft)]' : ''}
                  >
                    {item.t}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tiny timer dot */}
          <div
            className="absolute right-8 bottom-10 md:right-12 md:bottom-20 flex items-center gap-2 rounded-full border border-[var(--rule)] bg-white px-3 py-1.5 shadow-sm rise"
            style={{ animationDelay: '600ms' }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-brand blink" />
            <span className=" text-[11px] tracking-wider tabular-nums">
              07:42
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
