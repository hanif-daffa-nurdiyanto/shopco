import 'dotenv/config'

import { access, readFile } from 'node:fs/promises'
import path from 'node:path'

import { getPayload } from 'payload'
import sharp from 'sharp'

import config from '@/payload.config'

const localMediaDirectory = path.resolve(process.cwd(), 'media')
const figmaAssetDirectory = path.resolve(process.cwd(), 'public/images/figma')

const getOriginalFilename = (filename: string) => filename.replace(/-\d+(?=\.[^.]+$)/, '')

const findSourcePath = async (filename: string) => {
  const originalFilename = getOriginalFilename(filename)
  const candidates = [
    path.resolve(localMediaDirectory, originalFilename),
    path.resolve(figmaAssetDirectory, originalFilename.replace(/^seed-/, '')),
    path.resolve(
      figmaAssetDirectory,
      originalFilename.replace(/^seed-/, '').replace(/\.png$/, '.svg'),
    ),
  ]

  for (const candidate of candidates) {
    try {
      await access(candidate)
      return { filename: originalFilename, path: candidate }
    } catch {
      // Try the next known local source.
    }
  }

  return null
}

const migrateMediaToS3 = async () => {
  const payload = await getPayload({ config: await config })

  try {
    const media = await payload.find({
      collection: 'media',
      depth: 0,
      limit: 0,
      overrideAccess: true,
      pagination: false,
      select: {
        alt: true,
        caption: true,
        filename: true,
        mimeType: true,
      },
    })
    const missingFiles: string[] = []
    const onlySuffixed = process.argv.includes('--only-suffixed')
    const documents = onlySuffixed
      ? media.docs.filter((item) => item.filename !== getOriginalFilename(item.filename || ''))
      : media.docs
    let migrated = 0

    for (const item of documents) {
      if (!item.filename) continue

      const source = await findSourcePath(item.filename)
      if (!source) {
        missingFiles.push(item.filename)
        continue
      }
      if (
        !source.path.startsWith(`${localMediaDirectory}${path.sep}`) &&
        !source.path.startsWith(`${figmaAssetDirectory}${path.sep}`)
      ) {
        throw new Error(`Unsafe media filename: ${item.filename}`)
      }

      const sourceData = await readFile(source.path)
      const data = source.path.endsWith('.svg')
        ? await sharp(sourceData).png().toBuffer()
        : sourceData
      await payload.update({
        collection: 'media',
        context: { skipRevalidation: true },
        data: {
          alt: item.alt,
          caption: item.caption,
        },
        file: {
          data,
          mimetype: item.mimeType || 'application/octet-stream',
          name: source.filename,
          size: data.length,
        },
        id: item.id,
        overrideAccess: true,
        overwriteExistingFiles: true,
      })
      migrated += 1
      payload.logger.info(`Migrated media ${migrated}/${documents.length}: ${item.filename}`)
    }

    if (missingFiles.length > 0) {
      throw new Error(`Local source files missing: ${missingFiles.join(', ')}`)
    }

    payload.logger.info(`S3 media migration complete: ${migrated} records uploaded.`)
  } finally {
    await payload.db.destroy?.()
  }
}

void migrateMediaToS3()
