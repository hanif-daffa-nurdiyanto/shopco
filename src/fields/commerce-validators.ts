const validatePromotionValue = (
  value: null | number | undefined,
  type: null | string | undefined,
) => {
  if (value == null || !Number.isFinite(value) || value <= 0) {
    return 'Nilai promosi harus lebih besar dari nol.'
  }
  if (type === 'percentage' && value > 100) {
    return 'Persentase diskon tidak boleh lebih dari 100%.'
  }

  return true
}

const validateEndDate = (
  value: Date | null | string | undefined,
  startsAt: Date | null | string | undefined,
) =>
  !value || !startsAt || new Date(value) > new Date(startsAt)
    ? true
    : 'Tanggal selesai harus setelah tanggal mulai.'

const validatePositiveInteger = (value: null | number | undefined) =>
  value == null || (Number.isInteger(value) && value >= 0)
    ? true
    : 'Nilai harus berupa bilangan bulat nol atau lebih besar.'

export { validateEndDate, validatePositiveInteger, validatePromotionValue }
