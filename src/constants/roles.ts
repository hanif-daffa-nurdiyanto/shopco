const roles = ['admin', 'editor', 'customer'] as const

type UserRole = (typeof roles)[number]

type RolePermissions = {
  accessAdminPanel: boolean
  manageContent: boolean
  manageMedia: boolean
  manageOrders: boolean
  manageUsers: boolean
  readOwnOrders: boolean
}

const roleOptions = [
  { label: 'Admin', value: 'admin' },
  { label: 'Editor', value: 'editor' },
  { label: 'Customer', value: 'customer' },
] as const

const rolePermissionMatrix = {
  admin: {
    accessAdminPanel: true,
    manageContent: true,
    manageMedia: true,
    manageOrders: true,
    manageUsers: true,
    readOwnOrders: true,
  },
  editor: {
    accessAdminPanel: true,
    manageContent: true,
    manageMedia: true,
    manageOrders: false,
    manageUsers: false,
    readOwnOrders: true,
  },
  customer: {
    accessAdminPanel: false,
    manageContent: false,
    manageMedia: false,
    manageOrders: false,
    manageUsers: false,
    readOwnOrders: true,
  },
} as const satisfies Record<UserRole, RolePermissions>

const isUserRole = (value: unknown): value is UserRole =>
  typeof value === 'string' && roles.includes(value as UserRole)

export { isUserRole, roleOptions, rolePermissionMatrix, roles }
export type { RolePermissions, UserRole }
