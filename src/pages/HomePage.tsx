import { Logo } from '../components/ui/Logo'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-bg text-ink flex flex-col overflow-x-hidden">
      <header className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-5 flex items-center justify-between">
        <a href="/" aria-label="microchore home" className="anim-fade-up transition-opacity hover:opacity-80" style={{ animationDelay: '0ms' }}>
          <Logo className="h-9 w-auto" />
        </a>
        <nav
          className="flex items-center gap-4 sm:gap-7 text-sm text-ink-2 anim-fade-up"
          style={{ animationDelay: '80ms' }}
        >
          <a href="#how" className="nav-link hidden sm:inline-block">How it works</a>
          <a href="#creators" className="nav-link hidden sm:inline-block">For creators</a>
          <a href="#pricing" className="nav-link hidden sm:inline-block">Pricing</a>
          <a
            href="/login"
            className="btn-ghost inline-flex items-center rounded-md border border-divider bg-surface px-4 py-2 text-sm font-medium text-ink"
          >
            Sign in
          </a>
        </nav>
      </header>

      <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 pt-10 pb-14 md:pt-20 md:pb-24 flex-1 grid grid-cols-12 gap-8 md:gap-12 items-center">
        <div className="col-span-12 md:col-span-7">
          <p
            className="eyebrow mb-8 anim-fade-up"
            style={{ animationDelay: '120ms' }}
          >
            A microtask platform for viral comments
          </p>

          <h1
            className="font-serif text-[30px] sm:text-[44px] md:text-[56px] lg:text-[68px] leading-[1.05] tracking-tight md:tracking-tighter text-ink font-normal break-words anim-fade-up"
            style={{ animationDelay: '220ms' }}
          >
            Real comments,
            <br />
            <span className="signature">written by humans</span>,
            <br />
            paid by the post.
          </h1>

          <p
            className="mt-8 max-w-[58ch] text-[17px] text-ink-2 leading-relaxed anim-fade-up"
            style={{ animationDelay: '360ms' }}
          >
            Creators post a brief. Reviewers approve the best comments. Writers earn within the
            hour. No bots, no boosting, no scripts you have to clean up later.
          </p>

          <div
            className="mt-8 md:mt-12 flex flex-wrap items-center gap-3 anim-fade-up"
            style={{ animationDelay: '480ms' }}
          >
            <a
              href="/signup"
              className="btn-primary inline-flex items-center rounded-md px-6 py-3 text-sm font-medium text-white"
            >
              Start earning
            </a>
            <a
              href="/for-creators"
              className="btn-ghost inline-flex items-center rounded-md border border-divider bg-surface px-6 py-3 text-sm font-medium text-ink"
            >
              For creators
            </a>
          </div>

          <p
            className="mt-8 text-sm text-ink-3 anim-fade-up"
            style={{ animationDelay: '600ms' }}
          >
            Encrypted in transit and at rest. No payment credentials stored. We
            don&rsquo;t sell your data.
          </p>
        </div>

        <div
          className="col-span-12 md:col-span-5 anim-slide-in-right"
          style={{ animationDelay: '520ms' }}
        >
          <div className="receipt p-7 md:-rotate-2 transition-transform duration-300 ease-out hover:-translate-y-1">
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] tracking-stamp uppercase text-r-ink-2">
                Earnings &middot; this week
              </span>
              <span className="text-[11px] tracking-stamp uppercase text-r-ink-2">
                #00214
              </span>
            </div>

            <hr className="my-4" />

            <ul className="space-y-2 text-[13px]">
              <li className="flex justify-between">
                <span>Mon &middot; 7 approved</span>
                <span>$3.50</span>
              </li>
              <li className="flex justify-between">
                <span>Tue &middot; 12 approved</span>
                <span>$6.00</span>
              </li>
              <li className="flex justify-between">
                <span>Wed &middot; 9 approved</span>
                <span>$4.50</span>
              </li>
              <li className="flex justify-between">
                <span>Thu &middot; 14 approved</span>
                <span>$7.00</span>
              </li>
            </ul>

            <hr className="my-4" />

            <div className="flex justify-between text-[14px]">
              <span className="font-semibold">Total payable</span>
              <span className="font-semibold">$21.00</span>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <span className="text-[11px] tracking-stamp uppercase text-r-ink-2">
                Pays out Friday
              </span>
              <span className="stamp stamp--pending anim-stamp-pulse">pending</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-divider">
        <div className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between text-xs text-ink-3">
          <span className="font-mono tracking-stamp uppercase">microchore</span>
          <span>&copy; 2026 YRW Technologies</span>
        </div>
      </footer>
    </main>
  )
}
