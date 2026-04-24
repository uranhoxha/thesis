export function Manifesto() {
  return (
    <section
      id="manifesto"
      className="relative mx-auto max-w-[1280px] px-6 py-24 md:px-10 md:py-36"
    >
      <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-3">
          <span className=" text-[11px] tracking-[0.22em] uppercase text-[var(--soft)]">
            002 — Why
          </span>
          <div className="mt-3 h-px w-12 ink-rule" />
          <p className="mt-3  text-[11px] tracking-[0.18em] uppercase text-[var(--soft)]">
            A short note <br />
            from the kitchen
          </p>
        </div>

        <div className="md:col-span-9">
          <p
            className="font-display italic text-[clamp(2rem,4.5vw,3.6rem)] leading-[1.05] tracking-[-0.01em]"
            style={{ fontFamily: 'var(--font-display), serif' }}
          >
            &ldquo;Most recipe apps want your time. We just want your dinner to
            come out well.&rdquo;
          </p>

          <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-2">
            <p className="text-[17px] leading-[1.7] text-[var(--ink)]/85">
              Open a popular recipe app and you&apos;ll see ads, sponsored
              picks, ten-minute story videos, comments arguing about cumin.
              Hidden somewhere in there is a recipe — usually padded with a
              personal essay you didn&apos;t ask for.
            </p>
            <p className="text-[17px] leading-[1.7] text-[var(--ink)]/85">
              Cooksmth is the opposite. Write a recipe, save it, and it&apos;s
              there. Add things to a buy list while you read; check them off in
              the supermarket. Set a timer without leaving the page. Share what
              you cooked with one link.
            </p>
            <p className="text-[17px] leading-[1.7] text-[var(--ink)]/85">
              No engagement metrics. No streaks. No notifications nudging you to
              &ldquo;come back and cook.&rdquo; If you&apos;re cooking, the app
              is helping. If you&apos;re not, it&apos;s quiet.
            </p>
            <p className="text-[17px] leading-[1.7] text-[var(--ink)]/85">
              It&apos;s also a thesis project — which means it&apos;s allowed to
              be a little opinionated, a little weird, and built for one person
              at a time. The kind of tool you&apos;d actually keep open while
              the oven preheats.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
