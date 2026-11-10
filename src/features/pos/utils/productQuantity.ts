import type { ProductSalesUnit } from '../types/productCatalog'

export const getQuantityStep = (unit: ProductSalesUnit) => {
  const unitName = unit.nombre.trim().toLocaleLowerCase('es')
  const unitAbbreviation = unit.abreviatura.trim().toLocaleLowerCase('es')

  return unitName === 'libra' || unitAbbreviation === 'lb' ? 0.25 : 1
}

export const validateProductQuantity = (
  rawQuantity: string,
  unit: ProductSalesUnit
): string | null => {
  if (rawQuantity.trim() === '') return 'Ingresa una cantidad.'

  const quantity = Number(rawQuantity)
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return 'La cantidad debe ser un número positivo.'
  }

  if (quantity > 300) return 'La cantidad máxima por producto es 300.'

  if (getQuantityStep(unit) === 1 && !Number.isInteger(quantity)) {
    return 'Esta unidad solo admite cantidades enteras.'
  }

  return null
}
