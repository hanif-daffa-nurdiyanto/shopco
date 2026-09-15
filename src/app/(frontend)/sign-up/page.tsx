import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { AuthLayout } from '@/components/auth-layout'
import { SignUpForm } from '@/components/sign-up-form'
import { getAuthenticatedDestination } from '@/libs/auth-routing'
import { getCurrentUser } from '@/libs/storefront-auth'

const metadata: Metadata = {
  description: 'Create your SHOP.CO customer account.',
  title: 'Create account',
}

const SignUpPage = async () => {
  const user = await getCurrentUser()

  if (user?.status === 'active') redirect(getAuthenticatedDestination(user))

  return (
    <AuthLayout
      alternateHref="/sign-in"
      alternateLabel="Sign in"
      alternateText="Already have an account?"
      description="Join SHOP.CO to enjoy a faster, more personal shopping experience."
      title="Create account"
    >
      <SignUpForm />
    </AuthLayout>
  )
}

export { metadata }
export default SignUpPage
