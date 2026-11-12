import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../../../store'
import {
  centsToAmount,
  getLineSubtotalInCents
} from '../utils/cartCalculations'
import type { CartLineSummary, CartSummary } from '../types/cart'

const selectCartState = (state: RootState) => state.cart

export const selectCartLines = createSelector(
  [selectCartState],
  (cart): CartLineSummary[] =>
    cart.lines.map((line) => {
      const subtotalInCents = getLineSubtotalInCents(
        line.precio_unitario,
        line.cantidad
      ) ?? 0

      return { ...line, subtotal: centsToAmount(subtotalInCents) }
    })
)

export const selectCartLineCount = createSelector(
  [selectCartState],
  (cart) => cart.lines.length
)

export const selectCartTotal = createSelector(
  [selectCartState],
  (cart) => {
    const totalInCents = cart.lines.reduce((total, line) => {
      const subtotal = getLineSubtotalInCents(
        line.precio_unitario,
        line.cantidad
      )
      return total + (subtotal ?? 0)
    }, 0)

    return centsToAmount(totalInCents)
  }
)

export const selectCartValidationError = createSelector(
  [selectCartState],
  (cart) => cart.validationError
)

export const selectCartSummary = createSelector(
  [selectCartLines, selectCartTotal, selectCartLineCount],
  (lines, total, lineCount): CartSummary => ({ lines, total, lineCount })
)
