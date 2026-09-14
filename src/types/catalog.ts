type StockStatus = 'inStock' | 'lowStock' | 'outOfStock'

type ProductVariantInventory = {
  isActive?: boolean | null
  stock?: number | null
}

type ProductInventory = {
  stock?: number | null
  trackInventory?: boolean | null
  variants?: null | ProductVariantInventory[]
}

export type { ProductInventory, ProductVariantInventory, StockStatus }
