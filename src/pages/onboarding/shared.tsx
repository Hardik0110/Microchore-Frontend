import { type ReactNode } from 'react'
import { Eyebrow, HeadlineWithAccent } from '../../components/ui/primitives'

type StepShellProps = {
  eyebrow: string
  title: string
  accents?: string[]
  intro?: ReactNode
  children: ReactNode
}

export function StepShell({ eyebrow, title, accents = [], intro, children }: StepShellProps) {
  return (
    <section className="flex flex-col gap-6">
      <div>
        <Eyebrow dot>{eyebrow}</Eyebrow>
        <HeadlineWithAccent
          as="h1"
          text={title}
          accents={accents}
          className="mt-3 font-serif text-4xl md:text-5xl leading-[1.05] tracking-tighter font-normal text-ink"
        />
      </div>
      {intro ? <div className="text-base text-ink-2 leading-relaxed">{intro}</div> : null}
      <div className="mt-2 flex flex-col gap-6">{children}</div>
    </section>
  )
}
