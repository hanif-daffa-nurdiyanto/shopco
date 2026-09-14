import type { CollectionConfig } from 'payload'

import { editorOrAdmin } from '@/access'

const imageSizeAdmin = {
  disableGroupBy: true,
  disableListColumn: true,
  disableListFilter: true,
}

const Media: CollectionConfig = {
  slug: 'media',
  access: {
    create: editorOrAdmin,
    delete: editorOrAdmin,
    read: () => true,
    update: editorOrAdmin,
  },
  admin: {
    defaultColumns: ['filename', 'alt', 'updatedAt'],
    group: 'System',
    listSearchableFields: ['filename', 'alt', 'caption'],
    useAsTitle: 'filename',
  },
  defaultSort: '-updatedAt',
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'caption',
      type: 'textarea',
    },
  ],
  labels: {
    plural: 'Media',
    singular: 'Media Item',
  },
  upload: {
    adminThumbnail: 'thumbnail',
    crop: true,
    displayPreview: true,
    focalPoint: true,
    imageSizes: [
      {
        name: 'thumbnail',
        admin: imageSizeAdmin,
        height: 320,
        position: 'centre',
        width: 320,
        withoutEnlargement: true,
      },
      {
        name: 'productCard',
        admin: imageSizeAdmin,
        height: 600,
        position: 'centre',
        width: 600,
        withoutEnlargement: true,
      },
      {
        name: 'productDetail',
        admin: imageSizeAdmin,
        height: 1200,
        position: 'centre',
        width: 1200,
        withoutEnlargement: true,
      },
      {
        name: 'openGraph',
        admin: imageSizeAdmin,
        height: 630,
        position: 'centre',
        width: 1200,
        withoutEnlargement: true,
      },
    ],
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
  },
}

export { Media }
