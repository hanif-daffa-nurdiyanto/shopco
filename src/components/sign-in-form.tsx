'use client'

import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'

import type { UserRole } from '@/constants/roles'
import { getAuthenticatedDestination } from '@/libs/auth-routing'

type LoginResponse = {
  errors?: Array<{ message?: string }>
  message?: string
  user?: { roles?: null | UserRole[] }
}

const inputClassName =
  'mt-2 h-13 w-full rounded-full border border-black/10 bg-surface px-5 outline-none transition focus:border-black focus:bg-white focus:ring-2 focus:ring-black/10'

const SignInForm = () => {
  const router = useRouter()
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setPending(true)

    const form = new FormData(event.currentTarget)

    try {
      const response = await fetch('/api/users/login', {
        body: JSON.stringify({
          email: form.get('email'),
          password: form.get('password'),
        }),
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
      const result = (await response.json()) as LoginResponse

      if (!response.ok || !result.user) {
        setError('Email or password is incorrect.')
        return
      }

      router.replace(getAuthenticatedDestination(result.user))
      router.refresh()
    } catch {
      setError('Unable to sign in right now. Please try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label className="block text-sm font-medium" htmlFor="sign-in-email">
        Email address
      </label>
      <input
        autoComplete="email"
        className={inputClassName}
        id="sign-in-email"
        name="email"
        placeholder="you@example.com"
        required
        type="email"
      />

      <label className="mt-5 block text-sm font-medium" htmlFor="sign-in-password">
        Password
      </label>
      <input
        autoComplete="current-password"
        className={inputClassName}
        id="sign-in-password"
        minLength={8}
        name="password"
        placeholder="Enter your password"
        required
        type="password"
      />

      {error && (
        <p aria-live="polite" className="mt-4 rounded-xl bg-sale px-4 py-3 text-sm text-sale-text">
          {error}
        </p>
      )}

      <button
        className="mt-6 h-13 w-full rounded-full bg-ink font-medium text-white transition hover:bg-black/80 disabled:bg-black/30"
        disabled={pending}
        type="submit"
      >
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}

export { SignInForm }
