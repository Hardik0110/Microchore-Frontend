import { motion, useScroll, useSpring } from 'motion/react'
import { Logo } from '../components/ui/Logo'

export default function HomePage() {
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 30,
    restDelta: 0.001,
  })

  return (
    <main className="min-h-screen app-canvas text-ink flex flex-col overflow-x-hidden">
      <motion.div
        aria-hidden
        className="fixed top-0 left-0 right-0 h-[3px] origin-left z-50 bg-brand"
        style={{ scaleX: progress }}
      />
      <header className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-5 flex items-center justify-between">
        <a
          href="/"
          aria-label="microchore home"
          className="anim-fade-up transition-opacity hover:opacity-80"
          style={{ animationDelay: '0ms' }}
        >
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

      <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 pt-10 pb-14 md:pt-20 md:pb-24 grid grid-cols-12 gap-8 md:gap-12 items-center">
        <div className="col-span-12 md:col-span-7">
          <p className="eyebrow mb-8 anim-fade-up" style={{ animationDelay: '120ms' }}>
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
              href="#creators"
              className="btn-ghost inline-flex items-center rounded-md border border-divider bg-surface px-6 py-3 text-sm font-medium text-ink"
            >
              For creators
            </a>
          </div>

          <p className="mt-8 text-sm text-ink-3 anim-fade-up" style={{ animationDelay: '600ms' }}>
            Encrypted in transit and at rest. No payment credentials stored. We don&rsquo;t sell your data.
          </p>
        </div>

        <motion.div
          className="col-span-12 md:col-span-5"
          initial={{ opacity: 0, x: 140 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.45, type: 'spring', stiffness: 90, damping: 16, mass: 0.9 }}
        >
          <div className="receipt p-7 md:-rotate-2 transition-transform duration-300 ease-out hover:-translate-y-1">
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] tracking-stamp uppercase text-r-ink-2">
                Earnings &middot; this week
              </span>
              <span className="text-[11px] tracking-stamp uppercase text-r-ink-2">#00214</span>
            </div>
            <hr className="my-4" />
            <ul className="space-y-2 text-[13px]">
              <li className="flex justify-between"><span>Mon &middot; 7 approved</span><span>$3.50</span></li>
              <li className="flex justify-between"><span>Tue &middot; 12 approved</span><span>$6.00</span></li>
              <li className="flex justify-between"><span>Wed &middot; 9 approved</span><span>$4.50</span></li>
              <li className="flex justify-between"><span>Thu &middot; 14 approved</span><span>$7.00</span></li>
            </ul>
            <hr className="my-4" />
            <div className="flex justify-between text-[14px]">
              <span className="font-semibold">Total payable</span>
              <span className="font-semibold">$21.00</span>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <span className="text-[11px] tracking-stamp uppercase text-r-ink-2">Pays out Friday</span>
              <span className="stamp stamp--pending anim-stamp-pulse">pending</span>
            </div>
          </div>
        </motion.div>
      </section>

      <Section id="how">
        <SectionHeader
          eyebrow="How it works"
          title="Three steps. No middlemen."
          accents={['No middlemen']}
          intro="Pick a brief that fits your voice, write a comment a person would actually leave, get paid when a reviewer approves. The full loop runs in under an hour on a good day."
        />
        <div className="mt-12 relative">
          <svg
            aria-hidden
            className="hidden md:block absolute inset-x-0 -top-2 z-0 text-brand/40 pointer-events-none"
            viewBox="0 0 1200 90"
            preserveAspectRatio="none"
            width="100%"
            height="90"
          >
            <path
              d="M 80 60 Q 250 0 420 60 T 760 60 T 1120 60"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeDasharray="2 9"
              strokeLinecap="round"
            />
          </svg>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10">
            <HowStep
              n="01"
              title="Pick a brief"
              body="Open the marketplace, read a few short briefs, claim one that fits the kind of comments you already leave online. Each brief tells you the post, the target keyword, and the pay rate up front."
            />
            <HowStep
              n="02"
              title="Write the reply"
              body="Type your comment in our editor. Paste is disabled and your typing is tracked for quality. Add the keyword naturally, then drop the live link to your comment on the platform."
            />
            <HowStep
              n="03"
              title="Get paid"
              body="A reviewer reads it, rates it 1 to 5, and approves or declines with a one-line note. Approved comments stack on your earnings receipt and pay out on Friday."
            />
          </div>
        </div>
      </Section>

      <Section variant="surface">
        <SectionHeader
          eyebrow="In the app"
          title="What you see when you log in."
          accents={['log in']}
          intro="The dashboard puts your streak, pending earnings, and next brief one click away. Hover-animated icons, paper-receipt earnings, and stamped approvals make the loop feel tactile."
        />
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          <DashboardMockup />
          <ReceiptMockup />
        </div>
      </Section>

      <Section id="creators" cornerGlow>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div>
            <p className="eyebrow mb-4">For creators &amp; companies</p>
            <h2 className="font-serif text-[30px] md:text-[44px] leading-[1.08] tracking-tighter text-ink">
              Briefs that land in <span className="signature">the right voice</span>.
            </h2>
            <p className="mt-6 text-[15px] text-ink-2 leading-relaxed max-w-[55ch]">
              Drop in the post you want lifted, the keyword that needs to land, and the tone. We
              route it to a vetted pool of human writers and only ship comments that pass a real
              reviewer. No bot farms, no boosting, no template spam.
            </p>
            <ul className="mt-6 space-y-2.5 text-[14px] text-ink-2">
              <Bullet>One post, one pay rate, many writers</Bullet>
              <Bullet>Keyword + tone controls per brief</Bullet>
              <Bullet>Every reply reviewed by a human before payout</Bullet>
              <Bullet>Live link to each comment, on the actual platform</Bullet>
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="/signup"
                className="btn-primary inline-flex items-center rounded-md px-6 py-3 text-sm font-medium text-white"
              >
                Brief a project
              </a>
              <a
                href="#pricing"
                className="btn-ghost inline-flex items-center rounded-md border border-divider bg-surface px-6 py-3 text-sm font-medium text-ink"
              >
                See pricing
              </a>
            </div>
          </div>
          <CompanyMockup />
        </div>
      </Section>

      <Section id="pricing" variant="surface">
        <SectionHeader
          eyebrow="Pricing"
          title="You set the rate. We take a thin slice."
          accents={['thin slice']}
          intro="Pay-per-approved-comment. Set what each approved reply is worth to you, and only spend on work a reviewer cleared. No subscriptions, no minimums while you test."
        />
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
          <PricingCard
            tier="Pilot"
            price="$0"
            tagline="Test the loop"
            features={[
              'Up to 25 approved comments / month',
              '1 active project',
              'Standard 48-hour review window',
              'Slack support during business hours',
            ]}
            cta="Start free"
          />
          <PricingCard
            tier="Growth"
            price="10%"
            tagline="On top of payouts"
            features={[
              'Unlimited approved comments',
              'Unlimited active projects',
              'Priority review (under 12 hours)',
              'Brief consultation on tone + keyword fit',
            ]}
            cta="Brief a project"
            highlight
          />
          <PricingCard
            tier="Studio"
            price="Custom"
            tagline="For agencies"
            features={[
              'Volume discounting on platform fee',
              'Dedicated reviewer pool',
              'White-glove brief intake',
              'API access for embed in your dashboard',
            ]}
            cta="Talk to us"
          />
        </div>
      </Section>

      <Section cornerGlow>
        <SectionHeader
          eyebrow="The guarantees"
          title="What we will not do."
          accents={['will not']}
          intro="Trust on this platform comes from what we refuse to ship. Read this list, then ask any other commenting service to write theirs."
        />
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Guarantee
            title="No bots"
            body="Every comment is typed by a real person, paste blocked, keystroke pattern tracked."
          />
          <Guarantee
            title="No boosting"
            body="We don't buy likes, replies, or any platform engagement signals. Just comments."
          />
          <Guarantee
            title="No template spam"
            body="Reviewers reject any reply that reads scripted or AI-generated. Strict bar."
          />
          <Guarantee
            title="No surprise fees"
            body="You see the per-comment cost before claiming. No platform fees baked into payouts."
          />
        </div>
      </Section>

      <Section variant="surface">
        <div className="rounded-2xl border border-divider bg-surface px-6 py-12 md:px-14 md:py-16 shadow-card text-center">
          <p className="eyebrow">Ready when you are</p>
          <h2 className="mt-4 font-serif text-[30px] md:text-[44px] leading-[1.08] tracking-tighter text-ink">
            Real comments, <span className="signature">paid by the post</span>.
          </h2>
          <p className="mt-5 max-w-[58ch] mx-auto text-[15px] text-ink-2 leading-relaxed">
            Two minutes to sign up. Five practice tasks before the marketplace opens.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="/signup"
              className="btn-primary inline-flex items-center rounded-md px-7 py-3.5 text-sm font-medium text-white"
            >
              Start earning
            </a>
            <a
              href="#creators"
              className="btn-ghost inline-flex items-center rounded-md border border-divider bg-surface px-7 py-3.5 text-sm font-medium text-ink"
            >
              Brief a project
            </a>
          </div>
        </div>
      </Section>

      <footer className="border-t border-divider">
        <div className="mx-auto max-w-6xl px-6 py-10 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-3 max-w-[36ch]">
            <Logo className="h-8 w-auto" />
            <p className="text-[13px] text-ink-3 leading-relaxed">
              A microtask platform for viral comments. Built by humans, reviewed by humans, paid in
              hours.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-[13px]">
            <FootCol heading="Product">
              <FootLink href="#how">How it works</FootLink>
              <FootLink href="#creators">For creators</FootLink>
              <FootLink href="#pricing">Pricing</FootLink>
            </FootCol>
            <FootCol heading="Account">
              <FootLink href="/signup">Start earning</FootLink>
              <FootLink href="/login">Sign in</FootLink>
            </FootCol>
            <FootCol heading="Legal">
              <FootLink href="#">Privacy</FootLink>
              <FootLink href="#">Terms</FootLink>
              <FootLink href="#">Conduct</FootLink>
            </FootCol>
          </div>
        </div>
        <div className="border-t border-divider">
          <div className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between text-xs text-ink-3">
            <span className="font-mono tracking-stamp uppercase">microchore</span>
            <span>&copy; 2026 YRW Technologies</span>
          </div>
        </div>
      </footer>
    </main>
  )
}

function Section({
  id,
  variant = 'transparent',
  cornerGlow = false,
  children,
}: {
  id?: string
  variant?: 'transparent' | 'surface'
  cornerGlow?: boolean
  children: React.ReactNode
}) {
  return (
    <section
      id={id}
      className={
        'relative ' +
        (variant === 'surface' ? 'border-y border-divider bg-surface/60' : '')
      }
    >
      {cornerGlow ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            backgroundImage: `
              radial-gradient(ellipse 45% 55% at 0% 0%, rgba(37, 99, 235, 0.22), transparent 60%),
              radial-gradient(ellipse 45% 55% at 100% 0%, rgba(37, 99, 235, 0.20), transparent 60%),
              radial-gradient(ellipse 45% 55% at 0% 100%, rgba(37, 99, 235, 0.20), transparent 60%),
              radial-gradient(ellipse 45% 55% at 100% 100%, rgba(37, 99, 235, 0.22), transparent 60%)
            `,
          }}
        />
      ) : null}
      <motion.div
        className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 py-16 md:py-24"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </section>
  )
}

function SectionHeader({
  eyebrow,
  title,
  accents = [],
  intro,
}: {
  eyebrow: string
  title: string
  accents?: string[]
  intro?: string
}) {
  let rendered: React.ReactNode[] = [title]
  for (const word of accents) {
    const next: React.ReactNode[] = []
    for (const piece of rendered) {
      if (typeof piece === 'string' && piece.includes(word)) {
        const parts = piece.split(word)
        parts.forEach((p, idx) => {
          next.push(p)
          if (idx < parts.length - 1) {
            next.push(
              <span key={`${word}-${idx}-${next.length}`} className="signature">
                {word}
              </span>,
            )
          }
        })
      } else {
        next.push(piece)
      }
    }
    rendered = next
  }
  return (
    <div className="max-w-3xl">
      <p className="eyebrow mb-4">{eyebrow}</p>
      <h2 className="font-serif text-[30px] md:text-[44px] leading-[1.08] tracking-tighter text-ink">
        {rendered}
      </h2>
      {intro ? (
        <p className="mt-5 text-[15px] text-ink-2 leading-relaxed max-w-[58ch]">{intro}</p>
      ) : null}
    </div>
  )
}

function HowStep({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="rounded-xl border border-divider bg-surface p-6 shadow-card transition-transform duration-200 hover:-translate-y-0.5">
      <span className="block font-serif text-[44px] md:text-[56px] leading-none tracking-tighter text-brand tabular-nums">
        {n}
      </span>
      <h3 className="mt-4 text-[18px] font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-[13.5px] text-ink-2 leading-relaxed">{body}</p>
    </div>
  )
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden />
      <span>{children}</span>
    </li>
  )
}

function Guarantee({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-divider bg-surface p-5 shadow-card">
      <p className="font-mono text-[10px] tracking-stamp uppercase text-brand">{title}</p>
      <p className="mt-2 text-[13.5px] text-ink-2 leading-relaxed">{body}</p>
    </div>
  )
}

function PricingCard({
  tier,
  price,
  tagline,
  features,
  cta,
  highlight = false,
}: {
  tier: string
  price: string
  tagline: string
  features: string[]
  cta: string
  highlight?: boolean
}) {
  return (
    <div
      className={
        'rounded-xl border p-6 flex flex-col gap-4 shadow-card transition-transform duration-200 hover:-translate-y-0.5 ' +
        (highlight
          ? 'border-brand bg-brand-soft/40 ring-1 ring-brand/30'
          : 'border-divider bg-surface')
      }
    >
      <div>
        <p className="eyebrow">{tier}</p>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-serif text-[34px] leading-none text-ink tracking-tighter">
            {price}
          </span>
          <span className="text-[12px] text-ink-3">{tagline}</span>
        </div>
      </div>
      <ul className="flex flex-col gap-2 text-[13.5px] text-ink-2">
        {features.map((f) => (
          <Bullet key={f}>{f}</Bullet>
        ))}
      </ul>
      <a
        href="/signup"
        className={
          'mt-2 inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-medium transition-colors ' +
          (highlight
            ? 'bg-brand text-white hover:bg-brand-deep'
            : 'border border-divider bg-surface text-ink hover:border-ink-3')
        }
      >
        {cta}
      </a>
    </div>
  )
}

function FootCol({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-mono text-[10px] tracking-stamp uppercase text-ink-3">{heading}</p>
      <div className="flex flex-col gap-1.5">{children}</div>
    </div>
  )
}

function FootLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className="text-ink-2 transition-colors hover:text-brand">
      {children}
    </a>
  )
}

function DashboardMockup() {
  return (
    <div className="lg:col-span-3 rounded-xl border border-divider bg-surface shadow-card overflow-hidden">
      <div className="flex items-center gap-2 border-b border-divider px-4 py-2.5 bg-bg/60">
        <span className="h-2.5 w-2.5 rounded-full bg-danger/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
        <span className="ml-3 font-mono text-[10px] tracking-stamp uppercase text-ink-3">
          microchore.com/app
        </span>
      </div>
      <div className="grid grid-cols-12 min-h-[320px]">
        <div className="col-span-3 border-r border-divider p-4 bg-bg/40 flex flex-col gap-2">
          <p className="font-mono text-[9px] tracking-stamp uppercase text-ink-3">Overview</p>
          <div className="rounded-md bg-brand-soft text-brand px-2.5 py-1.5 text-[12px] font-medium">
            Dashboard
          </div>
          <p className="font-mono text-[9px] tracking-stamp uppercase text-ink-3 mt-3">Work</p>
          <span className="px-2.5 py-1.5 text-[12px] text-ink-2">Marketplace</span>
          <span className="px-2.5 py-1.5 text-[12px] text-ink-2">Submissions</span>
          <span className="px-2.5 py-1.5 text-[12px] text-ink-2">Earnings</span>
        </div>
        <div className="col-span-9 p-5 flex flex-col gap-4">
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-[18px] font-bold text-ink">Dashboard</h3>
              <p className="text-[11px] text-ink-3 mt-0.5">THU · MAY 28 · Cleared for real briefs</p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-divider bg-surface px-3 py-1.5 shadow-card">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-soft text-brand">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                </svg>
              </span>
              <span className="font-mono text-[15px] font-bold text-ink tabular-nums">12</span>
              <span className="font-mono text-[9px] tracking-stamp uppercase text-ink-3">day streak</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-divider p-3">
              <p className="font-mono text-[9px] tracking-stamp uppercase text-ink-3">Earned</p>
              <p className="font-mono text-[18px] font-bold text-ink mt-1 tabular-nums">$47.20</p>
            </div>
            <div className="rounded-lg border border-divider p-3">
              <p className="font-mono text-[9px] tracking-stamp uppercase text-ink-3">Pending</p>
              <p className="font-mono text-[18px] font-bold text-ink mt-1 tabular-nums">$6.40</p>
            </div>
          </div>
          <div className="rounded-lg border border-divider p-3">
            <p className="font-mono text-[9px] tracking-stamp uppercase text-ink-3">Next brief</p>
            <p className="text-[13px] text-ink mt-1.5 font-medium">Reply to launch tweet</p>
            <p className="text-[11px] text-ink-3 mt-0.5">Keyword: agents · Tone: product · 7 slots left</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function ReceiptMockup() {
  return (
    <div className="lg:col-span-2">
      <div className="receipt p-6 md:rotate-1 transition-transform duration-300 ease-out hover:-translate-y-1">
        <div className="flex items-baseline justify-between">
          <span className="text-[10px] tracking-stamp uppercase text-r-ink-2">Receipt #00478</span>
          <span className="text-[10px] tracking-stamp uppercase text-r-ink-2">May 27</span>
        </div>
        <hr className="my-3" />
        <p className="text-[12px] text-r-ink leading-relaxed">
          1x Comment, approved <br />
          Project: Acme launch tweet <br />
          Reviewer: T1 (rated 5 of 5)
        </p>
        <hr className="my-3" />
        <div className="flex justify-between text-[13px]">
          <span className="font-semibold">Paid</span>
          <span className="font-semibold">$0.40</span>
        </div>
        <div className="mt-5 flex items-center justify-between">
          <span className="text-[10px] tracking-stamp uppercase text-r-ink-2">Cleared instantly</span>
          <span className="stamp stamp--paid">paid</span>
        </div>
      </div>
    </div>
  )
}

function CompanyMockup() {
  return (
    <div className="rounded-xl border border-divider bg-surface shadow-card overflow-hidden">
      <div className="flex items-center gap-2 border-b border-divider px-4 py-2.5 bg-bg/60">
        <span className="h-2.5 w-2.5 rounded-full bg-danger/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
        <span className="ml-3 font-mono text-[10px] tracking-stamp uppercase text-ink-3">
          microchore.com/company
        </span>
      </div>
      <div className="p-5 flex flex-col gap-4 min-h-[320px]">
        <div className="flex items-baseline justify-between">
          <h3 className="text-[16px] font-bold text-ink">Acme launch tweet</h3>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-success/40 bg-success/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            active
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-[12px]">
          <div className="rounded-md border border-divider p-2.5">
            <p className="font-mono text-[9px] tracking-stamp uppercase text-ink-3">Slots</p>
            <p className="font-mono text-[15px] font-bold text-ink mt-0.5 tabular-nums">14 / 25</p>
          </div>
          <div className="rounded-md border border-divider p-2.5">
            <p className="font-mono text-[9px] tracking-stamp uppercase text-ink-3">Pay rate</p>
            <p className="font-mono text-[15px] font-bold text-ink mt-0.5 tabular-nums">$0.40</p>
          </div>
          <div className="rounded-md border border-divider p-2.5">
            <p className="font-mono text-[9px] tracking-stamp uppercase text-ink-3">Approved</p>
            <p className="font-mono text-[15px] font-bold text-success mt-0.5 tabular-nums">11</p>
          </div>
        </div>
        <div className="rounded-lg border border-divider p-3">
          <p className="font-mono text-[9px] tracking-stamp uppercase text-ink-3">Recent submissions</p>
          <ul className="mt-2 divide-y divide-dashed divide-divider">
            <li className="flex items-center justify-between py-1.5">
              <span className="text-[12px] text-ink truncate">writer1 - agents land harder when</span>
              <span className="stamp stamp--paid text-[9px]">paid</span>
            </li>
            <li className="flex items-center justify-between py-1.5">
              <span className="text-[12px] text-ink truncate">writer2 - the bit about latency hit</span>
              <span className="stamp stamp--paid text-[9px]">paid</span>
            </li>
            <li className="flex items-center justify-between py-1.5">
              <span className="text-[12px] text-ink truncate">writer3 - agents are doing the boring</span>
              <span className="stamp stamp--pending text-[9px]">pending</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
