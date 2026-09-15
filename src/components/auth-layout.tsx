import Link from 'next/link'
import type { ReactNode } from 'react'

type Props = {
  alternateHref: string
  alternateLabel: string
  alternateText: string
  children: ReactNode
  description: string
  title: string
}

const AuthLayout = ({
  alternateHref,
  alternateLabel,
  alternateText,
  children,
  description,
  title,
}: Props) => (
  <main className="border-t border-black/10 px-4 py-10 md:py-16">
    <section className="mx-auto grid max-w-245 overflow-hidden rounded-3xl border border-black/10 bg-white shadow-[0_20px_70px_rgba(0,0,0,0.08)] md:grid-cols-[0.85fr_1.15fr]">
      <div className="flex flex-col justify-between bg-ink p-8 text-white md:min-h-155 md:p-12">
        <div>
          <p className="font-display text-2xl font-bold">SHOP.CO</p>
          <h2 className="font-display mt-14 max-w-sm text-4xl leading-tight font-bold uppercase md:text-5xl">
            Style made personal.
          </h2>
          <p className="mt-5 max-w-sm text-white/70">
            Save your details, keep track of orders, and make checkout simpler.
          </p>
        </div>
        <p className="mt-12 text-sm text-white/50">Find clothes that match your style.</p>
      </div>

      <div className="p-6 sm:p-10 md:p-14">
        <h1 className="font-display text-3xl leading-none font-bold uppercase md:text-[40px]">
          {title}
        </h1>
        <p className="mt-4 text-muted">{description}</p>
        <div className="mt-8">{children}</div>
        <p className="mt-7 text-center text-sm text-muted">
          {alternateText}{' '}
          <Link className="font-bold text-ink underline underline-offset-4" href={alternateHref}>
            {alternateLabel}
          </Link>
        </p>
      </div>
    </section>
  </main>
)

export { AuthLayout }
