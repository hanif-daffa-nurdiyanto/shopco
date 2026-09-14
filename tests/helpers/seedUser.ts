import { getPayload } from 'payload'
import config from '../../src/payload.config.js'

export const testUser = {
  email: 'dev@payloadcms.com',
  name: 'Development Admin',
  password: 'test',
  roles: ['admin'] as Array<'admin' | 'customer' | 'editor'>,
  status: 'active' as const,
}

/**
 * Seeds a test user for e2e admin tests.
 */
export const seedTestUser = async (): Promise<void> => {
  const payload = await getPayload({ config })

  // Delete existing test user if any
  await payload.delete({
    collection: 'users',
    where: {
      email: {
        equals: testUser.email,
      },
    },
  })

  // Create fresh test user
  await payload.create({
    collection: 'users',
    data: testUser,
  })
}

/**
 * Cleans up test user after tests
 */
export const cleanupTestUser = async (): Promise<void> => {
  const payload = await getPayload({ config })

  await payload.delete({
    collection: 'users',
    where: {
      email: {
        equals: testUser.email,
      },
    },
  })
}
