import { readFile } from 'node:fs/promises'
import path from 'node:path'

import type { CollectionSlug, GlobalSlug, Payload, TypeWithID, Where } from 'payload'
import sharp from 'sharp'

type SeedKey = {
  field: string
  value: number | string
}

type UpsertCollectionOptions = {
  collection: CollectionSlug
  data: Record<string, unknown>
  draft?: boolean
  key: SeedKey
  payload: Payload
  updateExisting?: boolean
}

type SeedMediaOptions = {
  alt: string
  caption?: string
  filename: string
  payload: Payload
}

type UpdateSeedGlobalOptions = {
  data: Record<string, unknown>
  draft?: boolean
  payload: Payload
  slug: GlobalSlug
}

const createKeyWhere = ({ field, value }: SeedKey): Where => ({
  [field]: { equals: value },
})

const findBySeedKey = async <TDocument extends TypeWithID>(
  payload: Payload,
  collection: CollectionSlug,
  key: SeedKey,
) => {
  const result = await payload.find({
    collection,
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: createKeyWhere(key),
  })

  return result.docs[0] as unknown as TDocument | undefined
}

const upsertCollectionByKey = async <TDocument extends TypeWithID>({
  collection,
  data,
  draft,
  key,
  payload,
  updateExisting = true,
}: UpsertCollectionOptions) => {
  const existing = await findBySeedKey<TDocument>(payload, collection, key)

  if (existing) {
    if (!updateExisting) return existing

    return (await payload.update({
      collection,
      context: { skipRevalidation: true },
      data,
      draft,
      id: existing.id,
      overrideAccess: true,
    } as never)) as unknown as TDocument
  }

  return (await payload.create({
    collection,
    context: { skipRevalidation: true },
    data,
    draft,
    overrideAccess: true,
  } as never)) as unknown as TDocument
}

const getSeedMediaFilename = (filename: string) =>
  filename.endsWith('.svg') ? `seed-${filename.slice(0, -4)}.png` : `seed-${filename}`

const readSeedMediaFile = async (filename: string) => {
  const sourcePath = path.resolve(process.cwd(), 'public/images/figma', filename)
  const source = await readFile(sourcePath)
  const data = filename.endsWith('.svg') ? await sharp(source).png().toBuffer() : source
  const outputFilename = getSeedMediaFilename(filename)

  return {
    data,
    mimetype: 'image/png',
    name: outputFilename,
    size: data.length,
  }
}

const upsertSeedMedia = async ({ alt, caption, filename, payload }: SeedMediaOptions) => {
  const outputFilename = getSeedMediaFilename(filename)
  const existing = await findBySeedKey<TypeWithID & { filename?: null | string }>(
    payload,
    'media',
    { field: 'filename', value: outputFilename },
  )

  if (existing) {
    return payload.update({
      collection: 'media',
      context: { skipRevalidation: true },
      data: { alt, caption },
      id: existing.id,
      overrideAccess: true,
    })
  }

  return payload.create({
    collection: 'media',
    context: { skipRevalidation: true },
    data: { alt, caption },
    file: await readSeedMediaFile(filename),
    overrideAccess: true,
  })
}

const updateSeedGlobal = async <TDocument extends TypeWithID>({
  data,
  draft,
  payload,
  slug,
}: UpdateSeedGlobalOptions) =>
  (await payload.updateGlobal({
    context: { skipRevalidation: true },
    data,
    draft,
    overrideAccess: true,
    slug,
  } as never)) as unknown as TDocument

const isDevelopmentOrTest = () => process.env.NODE_ENV !== 'production'

export {
  findBySeedKey,
  getSeedMediaFilename,
  isDevelopmentOrTest,
  updateSeedGlobal,
  upsertCollectionByKey,
  upsertSeedMedia,
}
export type { SeedKey }
