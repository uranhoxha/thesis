import type { Metadata } from 'next'
import { Instrument_Serif, JetBrains_Mono } from 'next/font/google'

const display = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Cooksmth — a quiet recipe app for people who actually cook',
  description:
    'A clean, fast, opinionated tool for cooking. No ads, no scoring, no infinite scroll. Built for the kitchen, not for engagement metrics.',
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`${display.variable} ${mono.variable}`}>{children}</div>
  )
}
