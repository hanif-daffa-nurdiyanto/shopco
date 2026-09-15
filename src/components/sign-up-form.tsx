'use client'

import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'

type ErrorResponse = {
  error?: { message?: string }
}

const inputClassName =
  'mt-2 h-13 w-full rounded-full border border-black/10 bg-surface px-5 outline-none transition focus:border-black focus:bg-white focus:ring-2 focus:ring-black/10'

const SignUpForm = () => {
  const router = useRouter()
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setPending(true)

    const form = new FormData(event.currentTarget)
    const input = {
      email: form.get('email'),
      name: form.get('name'),
      password: form.get('password'),
      passwordConfirmation: form.get('passwordConfirmation'),
    }

    try {
      const signupResponse = await fetch('/api/storefront/auth/signup', {
        body: JSON.stringify(input),
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
      const signupResult = (await signupResponse.json()) as ErrorResponse

      if (!signupResponse.ok) {
        setError(signupResult.error?.message || 'Unable to create your account.')
        return
      }

      const loginResponse = await fetch('/api/users/login', {
        body: JSON.stringify({ email: input.email, password: input.password }),
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })

      if (!loginResponse.ok) {
        router.replace('/sign-in')
        router.refresh()
        return
      }

      router.replace('/account')
      router.refresh()
    } catch {
      setError('Unable to create your account right now. Please try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label className="block text-sm font-medium" htmlFor="sign-up-name">
        Full name
      </label>
      <input
        autoComplete="name"
        className={inputClassName}
        id="sign-up-name"
        maxLength={100}
        minLength={2}
        name="name"
        placeholder="Your full name"
        required
      />

      <label className="mt-5 block text-sm font-medium" htmlFor="sign-up-email">
        Email address
      </label>
      <input
        autoComplete="email"
        className={inputClassName}
        id="sign-up-email"
        name="email"
        placeholder="you@example.com"
        required
        type="email"
      />

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium" htmlFor="sign-up-password">
            Password
          </label>
          <input
            autoComplete="new-password"
            className={inputClassName}
            id="sign-up-password"
            maxLength={128}
            minLength={8}
            name="password"
            placeholder="Minimum 8 characters"
            required
            type="password"
          />
        </div>
        <div>
          <label className="block text-sm font-medium" htmlFor="sign-up-confirmation">
            Confirm password
          </label>
          <input
            autoComplete="new-password"
            className={inputClassName}
            id="sign-up-confirmation"
            maxLength={128}
            minLength={8}
            name="passwordConfirmation"
            placeholder="Repeat password"
            required
            type="password"
          />
        </div>
      </div>
      <p className="mt-3 text-xs text-muted">
        Use 8–128 characters with at least one letter and number.
      </p>

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
        {pending ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  )
}

export { SignUpForm }
