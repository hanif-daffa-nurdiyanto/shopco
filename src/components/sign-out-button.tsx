'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const SignOutButton = () => {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  const handleSignOut = async () => {
    setPending(true)

    try {
      await fetch('/api/users/logout', { credentials: 'same-origin', method: 'POST' })
    } finally {
      router.replace('/sign-in')
      router.refresh()
    }
  }

  return (
    <button
      className="h-12 rounded-full border border-black/15 px-7 font-medium transition hover:bg-ink hover:text-white disabled:opacity-50"
      disabled={pending}
      onClick={handleSignOut}
      type="button"
    >
      {pending ? 'Signing out…' : 'Sign out'}
    </button>
  )
}

export { SignOutButton }
