import type { ProductInventory, StockStatus } from '@/types/catalog'

const LOW_STOCK_THRESHOLD = 5

const normalizeSku = (value: unknown) =>
  typeof value === 'string' ? value.trim().toUpperCase() : value

const getAvailableStock = ({ stock = 0, variants }: ProductInventory) => {
  if (variants?.length) {
    return variants.reduce(
      (total, variant) => total + (variant.isActive === false ? 0 : Math.max(variant.stock ?? 0, 0)),
      0,
    )
  }

  return Math.max(stock ?? 0, 0)
}

const getStockStatus = (inventory: ProductInventory): StockStatus => {
  if (!inventory.trackInventory) return 'inStock'

  const availableStock = getAvailableStock(inventory)

  if (availableStock === 0) return 'outOfStock'
  if (availableStock <= LOW_STOCK_THRESHOLD) return 'lowStock'

  return 'inStock'
}

export { getAvailableStock, getStockStatus, LOW_STOCK_THRESHOLD, normalizeSku }
