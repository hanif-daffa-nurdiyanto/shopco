import type { AccessArgs, Field, GlobalConfig } from 'payload'
import { describe, expect, it } from 'vitest'

import {
  featuredReviewsFilter,
  publishedBrandsFilter,
  publishedCategoriesFilter,
  publishedProductsFilter,
} from '@/fields'
import { Footer } from '@/globals/footer'
import { Header } from '@/globals/header'
import { Homepage } from '@/globals/homepage'
import { StoreSettings } from '@/globals/store-settings'

const findNamedField = (fields: Field[], name: string): Field | undefined => {
  for (const field of fields) {
    if ('name' in field && field.name === name) return field

    if (field.type === 'tabs') {
      for (const tab of field.tabs) {
        const nestedField = findNamedField(tab.fields, name)
        if (nestedField) return nestedField
      }
    } else if ('fields' in field && Array.isArray(field.fields)) {
      const nestedField = findNamedField(field.fields, name)
      if (nestedField) return nestedField
    }
  }

  return undefined
}

const getTabLabels = (global: GlobalConfig) => {
  const tabsField = global.fields.find((field) => field.type === 'tabs')

  return tabsField?.type === 'tabs' ? tabsField.tabs.map(({ label }) => label) : []
}

const getSidebarFieldNames = (global: GlobalConfig) =>
  global.fields.flatMap((field) =>
    'name' in field && field.admin?.position === 'sidebar' ? [field.name] : [],
  )

const getArrayField = (global: GlobalConfig, name: string) => {
  const field = findNamedField(global.fields, name)

  if (field?.type !== 'array') throw new Error(`${name} is not an array field`)
  return field
}

const getRelationshipField = (global: GlobalConfig, name: string) => {
  const field = findNamedField(global.fields, name)

  if (field?.type !== 'relationship') throw new Error(`${name} is not a relationship field`)
  return field
}

const evaluateCondition = (
  global: GlobalConfig,
  name: string,
  data: Record<string, unknown>,
  siblingData: Record<string, unknown> = {},
) => {
  const field = findNamedField(global.fields, name)
  const condition = field?.admin?.condition as
    | ((data: Record<string, unknown>, siblingData: Record<string, unknown>) => boolean)
    | undefined

  return condition?.(data, siblingData)
}

const accessArgs = (
  user: null | Record<string, unknown>,
  query: Record<string, unknown> = {},
) => ({ req: { query, user } }) as unknown as AccessArgs

describe('global admin schema', () => {
  it('organizes every Global into task-focused unnamed tabs', () => {
    expect(getTabLabels(StoreSettings)).toEqual(['General', 'Commerce', 'SEO Defaults'])
    expect(getTabLabels(Header)).toEqual(['Announcement', 'Navigation', 'Actions'])
    expect(getTabLabels(Footer)).toEqual([
      'Brand',
      'Navigation',
      'Newsletter',
      'Legal & Payments',
    ])
    expect(getTabLabels(Homepage)).toEqual([
      'Hero',
      'Brands',
      'Product Sections',
      'Dress Styles',
      'Testimonials',
      'SEO',
    ])
  })

  it('keeps status and publication controls in the sidebar', () => {
    expect(getSidebarFieldNames(StoreSettings)).toEqual(
      expect.arrayContaining(['maintenanceMode', 'catalogEnabled']),
    )
    expect(getSidebarFieldNames(Header)).toContain('isActive')
    expect(getSidebarFieldNames(Footer)).toEqual(
      expect.arrayContaining(['isActive', 'showNewsletter']),
    )
    expect(getSidebarFieldNames(Homepage)).toContain('publishedAt')
  })

  it('enables versioned drafts for editorial Globals only', () => {
    expect(StoreSettings.versions).toBeUndefined()
    expect(Header.versions).toMatchObject({ drafts: true })
    expect(Footer.versions).toMatchObject({ drafts: true })
    expect(Homepage.versions).toMatchObject({ drafts: true })
  })

  it('enforces layout capacity with explicit array limits', () => {
    expect(getArrayField(Header, 'navigationItems').maxRows).toBe(6)
    expect(getArrayField(Header, 'children').maxRows).toBe(4)
    expect(getArrayField(Footer, 'socialLinks').maxRows).toBe(5)
    expect(getArrayField(Footer, 'linkGroups').maxRows).toBe(4)
    expect(getArrayField(Footer, 'links').maxRows).toBe(6)
    expect(getArrayField(Footer, 'legalLinks').maxRows).toBe(4)
    expect(getArrayField(Footer, 'paymentMethods').maxRows).toBe(6)
    expect(getArrayField(Homepage, 'statistics').maxRows).toBe(3)
    expect(getArrayField(Homepage, 'dressStyles').maxRows).toBe(4)
  })

  it('shows conditional controls only when their parent option is relevant', () => {
    expect(evaluateCondition(Header, 'announcementMessage', { announcementEnabled: true })).toBe(
      true,
    )
    expect(evaluateCondition(Header, 'announcementMessage', { announcementEnabled: false })).toBe(
      false,
    )
    expect(evaluateCondition(Header, 'logoImage', { logoType: 'image' })).toBe(true)
    expect(evaluateCondition(Header, 'logoImage', { logoType: 'text' })).toBe(false)
    expect(evaluateCondition(Footer, 'newsletterHeading', { showNewsletter: false })).toBe(false)
    expect(evaluateCondition(Homepage, 'products', {}, { mode: 'manual' })).toBe(true)
    expect(evaluateCondition(Homepage, 'automaticSource', {}, { mode: 'automatic' })).toBe(true)
  })

  it('filters Homepage and navigation relationships to storefront-safe records', () => {
    expect(getRelationshipField(Header, 'category').filterOptions).toEqual(
      publishedCategoriesFilter,
    )
    expect(getRelationshipField(Homepage, 'brands').filterOptions).toEqual(
      publishedBrandsFilter,
    )
    expect(getRelationshipField(Homepage, 'products').filterOptions).toEqual(
      publishedProductsFilter,
    )
    expect(getRelationshipField(Homepage, 'category').filterOptions).toEqual(
      publishedCategoriesFilter,
    )
    expect(getRelationshipField(Homepage, 'testimonials').filterOptions).toEqual(
      featuredReviewsFilter,
    )
  })

  it('caps relationship selections that are rendered as fixed homepage sections', async () => {
    const brands = getRelationshipField(Homepage, 'brands')
    const testimonials = getRelationshipField(Homepage, 'testimonials')
    const validateBrands = brands.validate as (value: number[]) => Promise<unknown> | unknown
    const validateTestimonials = testimonials.validate as (
      value: number[],
    ) => Promise<unknown> | unknown

    expect(await validateBrands(Array.from({ length: 8 }, (_, index) => index))).toBe(true)
    expect(await validateBrands(Array.from({ length: 9 }, (_, index) => index))).toEqual(
      expect.any(String),
    )
    expect(await validateTestimonials(Array.from({ length: 13 }, (_, index) => index))).toEqual(
      expect.any(String),
    )
  })

  it('allows public published reads but restricts editorial updates and drafts', async () => {
    const editor = { id: 2, roles: ['editor'], status: 'active' }
    const customer = { id: 3, roles: ['customer'], status: 'active' }

    expect(await Header.access?.read?.(accessArgs(null))).toBe(true)
    expect(await Header.access?.read?.(accessArgs(null, { draft: 'true' }))).toBe(false)
    expect(await Header.access?.read?.(accessArgs(editor, { draft: 'true' }))).toBe(true)
    expect(await Header.access?.update?.(accessArgs(editor))).toBe(true)
    expect(await Header.access?.update?.(accessArgs(customer))).toBe(false)
    expect(await StoreSettings.access?.update?.(accessArgs(editor))).toBe(false)
  })
})
