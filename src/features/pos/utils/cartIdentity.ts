import type { CartLine } from '../types/cart'
import { getPriceInCents } from './cartCalculations'

export const normalizeObservationText = (
  observations: string | null | undefined
): string | null => {
  const normalized = observations
    ?.normalize('NFKC')
    .trim()
    .replace(/\s+/gu, ' ') ?? ''

  return normalized || null
}

export const getNormalizedObservationKey = (
  observations: string | null | undefined
) => normalizeObservationText(observations)?.toLocaleLowerCase('es-GT') ?? ''

export const getCartLineMergeKey = (
  line: Pick<
    CartLine,
    'producto' | 'id_tipo_preparacion' | 'observaciones' | 'precio_unitario'
  >
) => {
  const priceInCents = getPriceInCents(line.precio_unitario)
  if (priceInCents === null) return null

  return JSON.stringify([
    line.producto.id,
    line.id_tipo_preparacion,
    getNormalizedObservationKey(line.observaciones),
    priceInCents
  ])
}

