const words = [
  'BRAISE',
  'SEAR',
  'SIMMER',
  'FOLD',
  'TASTE',
  'CHOP',
  'REST',
  'TOAST',
  'WHISK',
  'GLAZE',
  'REDUCE',
  'CARAMELIZE',
  'TEMPER',
  'PROOF',
  'BLOOM',
  'KNEAD',
]

export function Marquee() {
  const row = [...words, ...words]
  return (
    <div className="relative border-y border-[var(--rule)] bg-[var(--ink)] text-[var(--paper)] overflow-hidden">
      <div className="flex whitespace-nowrap py-4 marquee-track">
        {row.map((w, i) => (
          <span
            key={i}
            className="font-display italic text-[44px] sm:text-[56px] md:text-[68px] leading-none px-8 select-none"
            style={{ fontFamily: 'var(--font-display), serif' }}
          >
            {w}
            <span className="text-brand pl-8">·</span>
          </span>
        ))}
      </div>
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[var(--ink)] to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[var(--ink)] to-transparent pointer-events-none" />
    </div>
  )
}
