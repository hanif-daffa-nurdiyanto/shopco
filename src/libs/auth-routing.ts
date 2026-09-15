import type { UserRole } from '@/constants/roles'

type UserWithRoles = {
  roles?: null | UserRole[]
}

const getAuthenticatedDestination = (user: UserWithRoles) =>
  user.roles?.some((role) => role === 'admin' || role === 'editor') ? '/admin' : '/account'

export { getAuthenticatedDestination }
