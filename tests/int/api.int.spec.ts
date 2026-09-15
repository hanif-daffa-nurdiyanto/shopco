// @vitest-environment node

import config from '@/payload.config'
import type { Media, User } from '@/payload-types'
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const pixelPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
)

const createImageFile = (name: string, mimetype = 'image/png') => ({
  data: pixelPng,
  mimetype,
  name,
  size: pixelPng.length,
})

describe.sequential('Payload foundation', () => {
  let admin: User
  let customer: User
  let editor: User
  let inactiveEditor: User
  let media: Media | undefined
  let payload: Payload

  const uniqueKey = `${Date.now()}-${Math.random().toString(36).slice(2)}`

  beforeAll(async () => {
    payload = await getPayload({ config: await config })

    admin = await payload.create({
      collection: 'users',
      data: {
        email: `admin-${uniqueKey}@example.com`,
        name: 'Integration Admin',
        password: 'integration-password',
        roles: ['admin'],
        status: 'active',
      },
    })

    editor = await payload.create({
      collection: 'users',
      data: {
        email: `editor-${uniqueKey}@example.com`,
        name: 'Integration Editor',
        password: 'integration-password',
        roles: ['editor'],
        status: 'active',
      },
    })

    customer = await payload.create({
      collection: 'users',
      data: {
        email: `customer-${uniqueKey}@example.com`,
        name: 'Integration Customer',
        password: 'integration-password',
        roles: ['customer'],
        status: 'active',
      },
    })

    inactiveEditor = await payload.create({
      collection: 'users',
      data: {
        email: `inactive-${uniqueKey}@example.com`,
        name: 'Inactive Integration Editor',
        password: 'integration-password',
        roles: ['editor'],
        status: 'inactive',
      },
    })
  })

  afterAll(async () => {
    if (!payload) return

    if (media) {
      await payload.delete({ collection: 'media', id: media.id })
    }

    await payload.delete({
      collection: 'users',
      where: {
        email: { contains: uniqueKey },
      },
    })
  })

  it('logs an admin in with roles stored on the authenticated user', async () => {
    const result = await payload.login({
      collection: 'users',
      data: {
        email: admin.email,
        password: 'integration-password',
      },
    })

    expect(result.token).toBeTypeOf('string')
    expect(result.user?.roles).toContain('admin')
    expect(result.user?.status).toBe('active')
  })

  it('forces storefront signup records to the customer role', async () => {
    const signupCustomer = await payload.create({
      collection: 'users',
      context: { customerSignup: true },
      data: {
        email: `signup-${uniqueKey}@example.com`,
        name: 'Storefront Signup Customer',
        password: 'integration-password1',
        roles: ['admin'],
        status: 'inactive',
      },
      overrideAccess: true,
    })

    expect(signupCustomer.roles).toEqual(['customer'])
    expect(signupCustomer.status).toBe('active')
  })

  it('restricts customer user queries to their own document', async () => {
    const result = await payload.find({
      collection: 'users',
      overrideAccess: false,
      user: customer,
    })

    expect(result.docs).toHaveLength(1)
    expect(result.docs[0]?.id).toBe(customer.id)
  })

  it('blocks login for inactive users', async () => {
    await expect(
      payload.login({
        collection: 'users',
        data: {
          email: inactiveEditor.email,
          password: 'integration-password',
        },
      }),
    ).rejects.toThrow()
  })

  it('rejects customer media uploads and accepts editor image uploads', async () => {
    await expect(
      payload.create({
        collection: 'media',
        data: { alt: 'Restricted image' },
        file: createImageFile(`restricted-${uniqueKey}.png`),
        overrideAccess: false,
        user: customer,
      }),
    ).rejects.toThrow()

    media = await payload.create({
      collection: 'media',
      data: {
        alt: 'Storefront image',
        caption: 'Uploaded by an editor integration test.',
      },
      file: createImageFile(`storefront-${uniqueKey}.png`),
      overrideAccess: false,
      user: editor,
    })

    expect(media.mimeType).toBe('image/png')
    expect(media.caption).toBe('Uploaded by an editor integration test.')
  })

  it('rejects MIME types outside the Media allowlist', async () => {
    await expect(
      payload.create({
        collection: 'media',
        data: { alt: 'Invalid upload' },
        file: createImageFile(`invalid-${uniqueKey}.txt`, 'text/plain'),
        overrideAccess: false,
        user: editor,
      }),
    ).rejects.toThrow()
  })
})
