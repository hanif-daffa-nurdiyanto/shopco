const validateMoney = (value: null | number | undefined) =>
  value == null || (Number.isFinite(value) && value >= 0)
    ? true
    : 'Nilai uang harus berupa angka nol atau lebih besar.'

const validateCompareAtPrice = (
  value: null | number | undefined,
  price: null | number | undefined,
) => {
  const moneyResult = validateMoney(value)

  if (moneyResult !== true || value == null || price == null) return moneyResult

  return value > price ? true : 'Compare-at price harus lebih besar dari harga jual.'
}

const validateHexColor = (value: null | string | undefined) =>
  value == null || value === '' || /^#(?:[\da-f]{3}|[\da-f]{6}|[\da-f]{8})$/i.test(value)
    ? true
    : 'Gunakan warna HEX, misalnya #000000.'

const validateStock = (value: null | number | undefined) =>
  value == null || (Number.isInteger(value) && value >= 0)
    ? true
    : 'Stok harus berupa bilangan bulat nol atau lebih besar.'

const validateRating = (value: null | number | undefined) =>
  value != null && value >= 1 && value <= 5 && Number.isInteger(value * 2)
    ? true
    : 'Rating harus berada di antara 1–5 dengan kelipatan 0,5.'

type VariantWithSku = {
  sku?: null | string
}

const validateVariantSkus = (variants: null | undefined | VariantWithSku[]) => {
  if (!variants?.length) return true

  const normalizedSkus = variants
    .map(({ sku }) => sku?.trim().toUpperCase())
    .filter((sku): sku is string => Boolean(sku))

  return new Set(normalizedSkus).size === normalizedSkus.length
    ? true
    : 'Setiap variant harus memiliki SKU yang unik di dalam produk.'
}

export {
  validateCompareAtPrice,
  validateHexColor,
  validateMoney,
  validateRating,
  validateStock,
  validateVariantSkus,
}
