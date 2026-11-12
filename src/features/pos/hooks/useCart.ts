import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '../../../store'
import {
  addConfiguredProduct,
  clearCart,
  clearCartError,
  removeCartLine,
  setLineObservations,
  setLinePreparation,
  setLineQuantity
} from '../store/cartSlice'
import {
  selectCartLineCount,
  selectCartLines,
  selectCartSummary,
  selectCartTotal,
  selectCartValidationError
} from '../store/cartSelectors'
import type {
  RemoveCartLinePayload,
  SetLineObservationsPayload,
  SetLinePreparationPayload,
  SetLineQuantityPayload
} from '../types/cart'
import type { ConfiguredProduct } from '../types/productConfiguration'

export const useCart = () => {
  const dispatch = useDispatch<AppDispatch>()
  const lines = useSelector((state: RootState) => selectCartLines(state))
  const lineCount = useSelector((state: RootState) => selectCartLineCount(state))
  const total = useSelector((state: RootState) => selectCartTotal(state))
  const summary = useSelector((state: RootState) => selectCartSummary(state))
  const validationError = useSelector((state: RootState) =>
    selectCartValidationError(state)
  )

  const addProduct = useCallback(
    (configuration: ConfiguredProduct) => {
      dispatch(addConfiguredProduct(configuration))
    },
    [dispatch]
  )

  const updateQuantity = useCallback(
    (payload: SetLineQuantityPayload) => dispatch(setLineQuantity(payload)),
    [dispatch]
  )

  const updatePreparation = useCallback(
    (payload: SetLinePreparationPayload) => dispatch(setLinePreparation(payload)),
    [dispatch]
  )

  const updateObservations = useCallback(
    (payload: SetLineObservationsPayload) =>
      dispatch(setLineObservations(payload)),
    [dispatch]
  )

  const removeLine = useCallback(
    (payload: RemoveCartLinePayload) => dispatch(removeCartLine(payload)),
    [dispatch]
  )

  const emptyCart = useCallback(() => dispatch(clearCart()), [dispatch])
  const clearError = useCallback(() => dispatch(clearCartError()), [dispatch])

  return {
    lines,
    lineCount,
    total,
    summary,
    validationError,
    addConfiguredProduct: addProduct,
    setLineQuantity: updateQuantity,
    setLinePreparation: updatePreparation,
    setLineObservations: updateObservations,
    removeCartLine: removeLine,
    clearCart: emptyCart,
    clearCartError: clearError
  }
}
