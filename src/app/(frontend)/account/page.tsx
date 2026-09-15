import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { SignOutButton } from '@/components/sign-out-button'
import { hasRole } from '@/access'
import { getCurrentUser } from '@/libs/storefront-auth'

const metadata: Metadata = {
  description: 'Manage your SHOP.CO customer account.',
  title: 'My account',
}

const AccountPage = async () => {
  const user = await getCurrentUser()

  if (!user || user.status !== 'active') redirect('/sign-in')
  if (hasRole(user, ['admin', 'editor'])) redirect('/admin')
  if (!hasRole(user, ['customer'])) redirect('/sign-in')

  return (
    <main className="border-t border-black/10 px-4 py-10 md:py-16">
      <section className="mx-auto max-w-site">
        <p className="text-sm text-muted">My account</p>
        <div className="mt-4 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <h1 className="font-display text-[36px] leading-none font-bold uppercase md:text-5xl">
              Welcome, {user.name}
            </h1>
            <p className="mt-4 text-muted">Your SHOP.CO customer profile.</p>
          </div>
          <SignOutButton />
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <article className="rounded-3xl border border-black/10 p-6 md:p-8">
            <h2 className="text-xl font-bold">Profile details</h2>
            <dl className="mt-6 space-y-5">
              <div>
                <dt className="text-sm text-muted">Name</dt>
                <dd className="mt-1 font-medium">{user.name}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted">Email address</dt>
                <dd className="mt-1 font-medium">{user.email}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted">Account type</dt>
                <dd className="mt-1 font-medium capitalize">Customer</dd>
              </div>
            </dl>
          </article>

          <article className="rounded-3xl bg-surface p-6 md:p-8">
            <h2 className="text-xl font-bold">Your orders</h2>
            <p className="mt-3 text-muted">
              Orders placed with this account will appear here after checkout.
            </p>
            <Link
              className="mt-7 inline-flex h-12 items-center rounded-full bg-ink px-7 font-medium text-white"
              href="/"
            >
              Continue shopping
            </Link>
          </article>
        </div>
      </section>
    </main>
  )
}

export { metadata }
export default AccountPage
