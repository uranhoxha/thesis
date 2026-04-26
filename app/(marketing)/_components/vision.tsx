import { Search } from 'lucide-react'

const items = [
  {
    icon: Search,
    label: 'Search that thinks',
    body: 'Type "spicy weeknight chicken under 30 min" and find what you meant, not what you typed.',
  },
]

export function Vision() {
  return (
    <section id="vision" className="relative border-t border-[var(--rule)]">
      <div className="mx-auto max-w-[1280px] px-6 py-24 md:px-10 md:py-32">
        <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-5">
            <span className=" text-[11px] tracking-[0.22em] uppercase text-[var(--soft)]">
              004 — What&apos;s next
            </span>
            <h2
              className="mt-3 font-display text-[clamp(2.25rem,5vw,3.6rem)] leading-[1] tracking-[-0.02em]"
              style={{ fontFamily: 'var(--font-display), serif' }}
            >
              In the <span className="italic">prep</span>.
            </h2>
          </div>
          <p className="md:col-span-7 max-w-2xl text-[17px] leading-[1.7] text-[var(--ink)]/80">
            One quiet experiment is still in the kitchen. The bar is the same as
            the rest of the app: it has to make cooking easier, not just look
            clever in a screenshot.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
          {items.map((it, i) => {
            const Icon = it.icon
            return (
              <div
                key={i}
                className="relative overflow-hidden rounded-2xl border border-dashed border-[var(--rule)] bg-transparent p-7"
              >
                <div className="flex items-center gap-2">
                  <span className=" text-[10px] tracking-[0.22em] uppercase text-[var(--soft)]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="rounded-full bg-[var(--ink)]/8 px-2 py-0.5  text-[9px] tracking-[0.18em] uppercase text-[var(--soft)]">
                    soon
                  </span>
                </div>
                <Icon className="mt-5 h-7 w-7 text-brand opacity-80" />
                <h3
                  className="mt-3 font-display text-[28px] leading-tight tracking-[-0.01em]"
                  style={{ fontFamily: 'var(--font-display), serif' }}
                >
                  {it.label}
                </h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-[var(--ink)]/70">
                  {it.body}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
