import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { validateProductQuantity } from '../utils/productQuantity'
import { getCartLineMergeKey, normalizeObservationText } from '../utils/cartIdentity'
import { addQuantities, getPriceInCents } from '../utils/cartCalculations'
import type {
  CartLine,
  CartState,
  RemoveCartLinePayload,
  SetLineObservationsPayload,
  SetLinePreparationPayload,
  SetLineQuantityPayload
} from '../types/cart'
import type { ConfiguredProduct } from '../types/productConfiguration'

const MAX_CART_LINES = 50
const MAX_OBSERVATION_LENGTH = 255

const initialState: CartState = {
  lines: [],
  nextLineId: 1,
  validationError: null
}

const setValidationError = (state: CartState, message: string) => {
  state.validationError = message
}

const validateQuantity = (quantity: number, line: CartLine) =>
  validateProductQuantity(String(quantity), line.producto.unidad_venta)

const applyLineChanges = (
  state: CartState,
  lineId: string,
  changes: Partial<
    Pick<
      CartLine,
      | 'cantidad'
      | 'id_tipo_preparacion'
      | 'nombre_preparacion'
      | 'observaciones'
    >
  >
) => {
  const lineIndex = state.lines.findIndex((line) => line.lineId === lineId)
  if (lineIndex < 0) {
    setValidationError(state, 'No se encontró la línea del pedido que intentas editar.')
    return
  }

  const sourceLine = state.lines[lineIndex]
  const updatedLine = { ...sourceLine, ...changes }
  const updatedKey = getCartLineMergeKey(updatedLine)
  const matchingLine = updatedKey
    ? state.lines.find(
      (line) => line.lineId !== lineId && getCartLineMergeKey(line) === updatedKey
    )
    : null

  if (matchingLine) {
    const combinedQuantity = addQuantities(
      matchingLine.cantidad,
      updatedLine.cantidad
    )
    const quantityError = validateQuantity(combinedQuantity, matchingLine)
    if (quantityError) {
      setValidationError(
        state,
        `No se pudo combinar la línea: ${quantityError}`
      )
      return
    }

    matchingLine.cantidad = combinedQuantity
    state.lines.splice(lineIndex, 1)
  } else {
    Object.assign(sourceLine, changes)
  }

  state.validationError = null
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addConfiguredProduct: (
      state,
      { payload }: PayloadAction<ConfiguredProduct>
    ) => {
      const quantityError = validateProductQuantity(
        String(payload.cantidad),
        payload.producto.unidad_venta
      )
      if (quantityError) {
        setValidationError(state, quantityError)
        return
      }

      if (!payload.producto.id.trim()) {
        setValidationError(state, 'El producto no tiene un identificador válido.')
        return
      }

      if (getPriceInCents(payload.precio_unitario) === null) {
        setValidationError(state, 'El precio del producto no es válido.')
        return
      }

      if (
        (payload.id_tipo_preparacion === null &&
          payload.nombre_preparacion !== null) ||
        (payload.id_tipo_preparacion !== null &&
          (!payload.id_tipo_preparacion.trim() ||
            !payload.nombre_preparacion?.trim()))
      ) {
        setValidationError(state, 'La preparación seleccionada no es válida.')
        return
      }

      const observations = normalizeObservationText(payload.observaciones)
      if (observations && observations.length > MAX_OBSERVATION_LENGTH) {
        setValidationError(state, 'Las observaciones no pueden superar 255 caracteres.')
        return
      }

      const candidate: CartLine = {
        lineId: '',
        producto: payload.producto,
        cantidad: payload.cantidad,
        id_tipo_preparacion: payload.id_tipo_preparacion,
        nombre_preparacion: payload.nombre_preparacion,
        observaciones: observations,
        precio_unitario: payload.precio_unitario
      }
      const candidateKey = getCartLineMergeKey(candidate)
      const existingLine = candidateKey
        ? state.lines.find((line) => getCartLineMergeKey(line) === candidateKey)
        : null

      if (existingLine) {
        const combinedQuantity = addQuantities(
          existingLine.cantidad,
          candidate.cantidad
        )
        const combinedQuantityError = validateQuantity(combinedQuantity, existingLine)
        if (combinedQuantityError) {
          setValidationError(state, combinedQuantityError)
          return
        }

        existingLine.cantidad = combinedQuantity
        state.validationError = null
        return
      }

      if (state.lines.length >= MAX_CART_LINES) {
        setValidationError(state, 'El pedido no puede tener más de 50 líneas.')
        return
      }

      candidate.lineId = `line-${state.nextLineId}`
      state.nextLineId += 1
      state.lines.push(candidate)
      state.validationError = null
    },
    setLineQuantity: (
      state,
      { payload }: PayloadAction<SetLineQuantityPayload>
    ) => {
      const line = state.lines.find((item) => item.lineId === payload.lineId)
      if (!line) {
        setValidationError(state, 'No se encontró la línea del pedido que intentas editar.')
        return
      }

      const quantityError = validateQuantity(payload.cantidad, line)
      if (quantityError) {
        setValidationError(state, quantityError)
        return
      }

      applyLineChanges(state, payload.lineId, { cantidad: payload.cantidad })
    },
    setLinePreparation: (
      state,
      { payload }: PayloadAction<SetLinePreparationPayload>
    ) => {
      if (
        (payload.id_tipo_preparacion === null &&
          payload.nombre_preparacion !== null) ||
        (payload.id_tipo_preparacion !== null &&
          (!payload.id_tipo_preparacion.trim() ||
            !payload.nombre_preparacion?.trim()))
      ) {
        setValidationError(state, 'La preparación seleccionada no es válida.')
        return
      }

      applyLineChanges(state, payload.lineId, {
        id_tipo_preparacion: payload.id_tipo_preparacion,
        nombre_preparacion: payload.id_tipo_preparacion
          ? payload.nombre_preparacion?.trim() ?? null
          : null
      })
    },
    setLineObservations: (
      state,
      { payload }: PayloadAction<SetLineObservationsPayload>
    ) => {
      const observations = normalizeObservationText(payload.observaciones)
      if (observations && observations.length > MAX_OBSERVATION_LENGTH) {
        setValidationError(state, 'Las observaciones no pueden superar 255 caracteres.')
        return
      }

      applyLineChanges(state, payload.lineId, { observaciones: observations })
    },
    removeCartLine: (
      state,
      { payload }: PayloadAction<RemoveCartLinePayload>
    ) => {
      state.lines = state.lines.filter((line) => line.lineId !== payload.lineId)
      state.validationError = null
    },
    clearCart: (state) => {
      state.lines = []
      state.validationError = null
    },
    clearCartError: (state) => {
      state.validationError = null
    }
  }
})

export const {
  addConfiguredProduct,
  setLineQuantity,
  setLinePreparation,
  setLineObservations,
  removeCartLine,
  clearCart,
  clearCartError
} = cartSlice.actions

export const cartReducer = cartSlice.reducer
