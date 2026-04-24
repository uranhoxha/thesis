'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useMarketingTheme } from './theme-context'
import { cn } from '@/lib/utils'

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

export function Nav() {
  const { theme } = useMarketingTheme()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={cn(
        'sticky top-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-[var(--rule)] bg-[var(--paper)]/80 backdrop-blur-md'
          : 'border-b border-transparent',
      )}
    >
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-4 md:px-10">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src={logos[theme]}
            alt="Cooksmth"
            className="h-7 w-auto transition-all"
            priority
          />
        </Link>

        <div className="hidden md:flex items-center gap-8  text-[11px] tracking-[0.16em] uppercase text-[var(--ink)]">
          <a href="#manifesto" className="hover:text-brand transition-colors">
            Manifesto
          </a>
          <a href="#features" className="hover:text-brand transition-colors">
            Features
          </a>
          <a href="#vision" className="hover:text-brand transition-colors">
            What&apos;s Next
          </a>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="px-3 py-2  text-[11px] tracking-[0.16em] uppercase text-[var(--ink)] hover:text-brand transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-md bg-brand px-4 py-2  text-[11px] tracking-[0.16em] uppercase text-white shadow-sm hover:bg-brand/90 transition-colors"
          >
            Get started
          </Link>
        </div>
      </div>
    </nav>
  )
}
