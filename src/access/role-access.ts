import type { Access, FieldAccess, Where } from 'payload'

import type { UserRole } from '@/constants/roles'

type UserWithRoles = {
  id?: number | string
  roles?: null | UserRole[]
  status?: 'active' | 'inactive'
}

const getUser = (user: unknown): null | UserWithRoles =>
  user && typeof user === 'object' ? (user as UserWithRoles) : null

const hasRole = (user: unknown, allowedRoles: readonly UserRole[]) => {
  const authenticatedUser = getUser(user)

  if (authenticatedUser?.status === 'inactive') return false

  return authenticatedUser?.roles?.some((role) => allowedRoles.includes(role)) ?? false
}

const authenticated: Access = ({ req: { user } }) => Boolean(user)

const anyone: Access = () => true

const publicGlobalRead: Access = ({ req }) => {
  const draftRequested = req.query?.draft === true || req.query?.draft === 'true'

  return draftRequested ? hasRole(req.user, ['admin', 'editor']) : true
}

const adminOnly: Access = ({ req: { user } }) => hasRole(user, ['admin'])

const editorOrAdmin: Access = ({ req: { user } }) => hasRole(user, ['admin', 'editor'])

const customerOnly: Access = ({ req: { user } }) => hasRole(user, ['customer'])

const adminOnlyField: FieldAccess = ({ req: { user } }) => hasRole(user, ['admin'])

const editorOrAdminField: FieldAccess = ({ req: { user } }) =>
  hasRole(user, ['admin', 'editor'])

const adminOrSelf: Access = ({ req: { user } }) => {
  const authenticatedUser = getUser(user)

  if (!authenticatedUser?.id) return false
  if (hasRole(authenticatedUser, ['admin'])) return true

  return {
    id: {
      equals: authenticatedUser.id,
    },
  }
}

const publishedOrEditor: Access = ({ req: { user } }) => {
  if (hasRole(user, ['admin', 'editor'])) return true

  return {
    _status: {
      equals: 'published',
    },
  }
}

const publishedOrEditorWith = (publicWhere: Where): Access =>
  ({ req: { user } }) => {
    if (hasRole(user, ['admin', 'editor'])) return true

    return {
      and: [
        {
          _status: {
            equals: 'published',
          },
        },
        publicWhere,
      ],
    }
  }

const approvedOrEditor: Access = ({ req: { user } }) => {
  if (hasRole(user, ['admin', 'editor'])) return true

  return {
    status: {
      equals: 'approved',
    },
  }
}

const adminOrCustomerOwnOrders: Access = ({ req: { user } }) => {
  const authenticatedUser = getUser(user)

  if (!authenticatedUser?.id) return false
  if (hasRole(authenticatedUser, ['admin'])) return true
  if (!hasRole(authenticatedUser, ['customer'])) return false

  return {
    customer: {
      equals: authenticatedUser.id,
    },
  }
}

export {
  adminOnly,
  adminOnlyField,
  adminOrCustomerOwnOrders,
  adminOrSelf,
  approvedOrEditor,
  anyone,
  authenticated,
  customerOnly,
  editorOrAdmin,
  editorOrAdminField,
  getUser,
  hasRole,
  publishedOrEditor,
  publishedOrEditorWith,
  publicGlobalRead,
}
