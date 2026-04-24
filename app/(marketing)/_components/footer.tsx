import Image from 'next/image'
import Link from 'next/link'
import GreenLogo from '@/public/green_logo.svg'
import RedLogo from '@/public/red_logo.svg'
import BlueLogo from '@/public/blue_logo.svg'
import YellowLogo from '@/public/yellow_logo.svg'

export function Footer() {
  return (
    <footer className="border-t border-[var(--rule)] bg-[var(--paper)]">
      <div className="mx-auto max-w-[1280px] px-6 py-16 md:px-10 md:py-20">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="md:col-span-6">
            <p
              className="font-display text-[clamp(1.75rem,3vw,2.4rem)] leading-tight italic"
              style={{ fontFamily: 'var(--font-display), serif' }}
            >
              Built for the kitchen,
              <br />
              not for engagement metrics.
            </p>

            <div className="mt-8 flex items-center gap-3">
              {[GreenLogo, RedLogo, BlueLogo, YellowLogo].map((L, i) => (
                <Image
                  key={i}
                  src={L}
                  alt=""
                  className="h-7 w-auto opacity-80 hover:opacity-100 transition-opacity"
                />
              ))}
            </div>
          </div>

          <div className="md:col-span-3">
            <span className=" text-[10px] tracking-[0.22em] uppercase text-[var(--soft)]">
              Get started
            </span>
            <ul className="mt-4 space-y-2.5 text-[15px]">
              <li>
                <Link
                  href="/signup"
                  className="hover:text-brand transition-colors"
                >
                  Create account
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="hover:text-brand transition-colors"
                >
                  Sign in
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <span className=" text-[10px] tracking-[0.22em] uppercase text-[var(--soft)]">
              About
            </span>
            <ul className="mt-4 space-y-2.5 text-[15px]">
              <li>
                <a
                  href="#manifesto"
                  className="hover:text-brand transition-colors"
                >
                  Why this exists
                </a>
              </li>
              <li>
                <a
                  href="#features"
                  className="hover:text-brand transition-colors"
                >
                  What&apos;s inside
                </a>
              </li>
              <li>
                <a
                  href="#vision"
                  className="hover:text-brand transition-colors"
                >
                  What&apos;s next
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-[var(--rule)] pt-6 text-[var(--soft)] sm:flex-row sm:items-center">
          <span className=" text-[10px] tracking-[0.22em] uppercase">
            © 2026 · Cooksmth · A thesis project
          </span>
          <span className=" text-[10px] tracking-[0.22em] uppercase">
            Stay hydrated while cooking.
          </span>
        </div>
      </div>
    </footer>
  )
}
