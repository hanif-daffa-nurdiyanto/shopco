import { Forbidden, type CollectionConfig } from 'payload'

import { adminOnly, adminOnlyField, adminOrSelf, editorOrAdminField } from '@/access'
import { roleOptions } from '@/constants/roles'
import type { User } from '@/payload-types'

type BeforeLoginHook = NonNullable<NonNullable<CollectionConfig['hooks']>['beforeLogin']>[number]

const blockInactiveUser: BeforeLoginHook = ({ req, user }) => {
  if ((user as User).status === 'inactive') throw new Forbidden(req.t)
}

const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: editorOrAdminField,
    create: adminOnly,
    delete: adminOnly,
    read: adminOrSelf,
    update: adminOrSelf,
  },
  admin: {
    defaultColumns: ['name', 'email', 'roles', 'status', 'updatedAt'],
    group: 'System',
    listSearchableFields: ['name', 'email'],
    useAsTitle: 'name',
  },
  auth: true,
  defaultSort: '-updatedAt',
  hooks: {
    beforeLogin: [blockInactiveUser],
    beforeValidate: [
      async ({ data, operation, req }) => {
        if (operation !== 'create') return data

        if (req.context.customerSignup === true) {
          return {
            ...data,
            roles: ['customer'],
            status: 'active',
          }
        }

        const { totalDocs } = await req.payload.count({
          collection: 'users',
          overrideAccess: true,
          req,
        })

        return totalDocs === 0
          ? {
              ...data,
              roles: ['admin'],
              status: 'active',
            }
          : data
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'roles',
      type: 'select',
      access: {
        create: adminOnlyField,
        update: adminOnlyField,
      },
      admin: {
        position: 'sidebar',
      },
      defaultValue: ['customer'],
      hasMany: true,
      options: [...roleOptions],
      required: true,
      saveToJWT: true,
    },
    {
      name: 'status',
      type: 'select',
      access: {
        create: adminOnlyField,
        update: adminOnlyField,
      },
      admin: {
        position: 'sidebar',
      },
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
      required: true,
      saveToJWT: true,
    },
  ],
  labels: {
    plural: 'Users',
    singular: 'User',
  },
}

export { Users }
