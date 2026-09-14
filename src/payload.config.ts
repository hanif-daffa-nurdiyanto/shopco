import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
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
  plugins: [],
})
