import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { AuthLayout } from '@/components/auth-layout'
import { SignInForm } from '@/components/sign-in-form'
import { getAuthenticatedDestination } from '@/libs/auth-routing'
import { getCurrentUser } from '@/libs/storefront-auth'

const metadata: Metadata = {
  description: 'Sign in to your SHOP.CO account.',
  title: 'Sign in',
}

const SignInPage = async () => {
  const user = await getCurrentUser()

  if (user?.status === 'active') redirect(getAuthenticatedDestination(user))

  return (
    <AuthLayout
      alternateHref="/sign-up"
      alternateLabel="Create one"
      alternateText="Don't have an account?"
      description="Welcome back. Enter your details to access your account."
      title="Sign in"
    >
      <SignInForm />
    </AuthLayout>
  )
}

export { metadata }
export default SignInPage
