import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Brands } from './collections/brands-collection'
import { Categories } from './collections/categories-collection'
import { Media } from './collections/media-collection'
import { Orders } from './collections/orders-collection'
import { Products } from './collections/products-collection'
import { Promotions } from './collections/promotions-collection'
import { Reviews } from './collections/reviews-collection'
import { Users } from './collections/users-collection'
import { storefrontCommerceEndpoints } from './endpoints/storefront-commerce'
import { Footer } from './globals/footer'
import { Header } from './globals/header'
import { Homepage } from './globals/homepage'
import { StoreSettings } from './globals/store-settings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const s3Endpoint = process.env.S3_ENDPOINT?.replace(/\/$/, '')
const s3Bucket = process.env.S3_BUCKET
const s3AccessKeyId = process.env.S3_ACCESS_KEY_ID
const s3SecretAccessKey = process.env.S3_SECRET_ACCESS_KEY
const s3Values = [s3Endpoint, s3Bucket, s3AccessKeyId, s3SecretAccessKey]
const isS3Configured = s3Values.every(Boolean)

if (s3Values.some(Boolean) && !isS3Configured) {
  throw new Error(
    'S3 storage configuration is incomplete. Set S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY_ID, and S3_SECRET_ACCESS_KEY.',
  )
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Brands, Categories, Products, Reviews, Promotions, Orders],
  endpoints: storefrontCommerceEndpoints,
  globals: [StoreSettings, Header, Footer, Homepage],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [
    s3Storage({
      bucket: s3Bucket || 'media-shopco',
      collections: {
        media: true,
      },
      config: {
        credentials: {
          accessKeyId: s3AccessKeyId || '',
          secretAccessKey: s3SecretAccessKey || '',
        },
        endpoint: s3Endpoint,
        forcePathStyle: true,
        region: process.env.S3_REGION || 'garage',
      },
      disableLocalStorage: true,
      enabled: isS3Configured,
    }),
  ],
})
