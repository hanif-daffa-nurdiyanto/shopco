import type { Product } from './product'

type ProductReview = {
  id: string
  author: string
  content: string
  date: string
  rating: number
}

type ProductVariantOption = {
  active: boolean
  colorHex: string
  colorName: string
  id: string
  price: number
  size: string
  stock: number
}

type ProductDetail = Product & {
  colors: string[]
  description: string
  details: ProductDetailItem[]
  gallery: string[]
  sku?: string
  sizes: string[]
  variants?: ProductVariantOption[]
}

type ProductDetailItem = {
  label: string
  value: string
}

export type { ProductDetail, ProductDetailItem, ProductReview, ProductVariantOption }
