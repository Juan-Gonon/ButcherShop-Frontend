import type {
  BuildCreateOrderRequestInput,
  BuildCreateOrderRequestResult,
  CreateOrderProductRequest
} from '../types/createOrder'
import type { OrderDeliveryPayload } from '../types/delivery'
import { validateProductQuantity } from './productQuantity'

const MAX_ORDER_LINES = 50
const MAX_OBSERVATION_LENGTH = 255
const UUID_PATTERN = /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i
const INTEGER_PATTERN = /^\d+$/

const toPositiveSafeInteger = (value: string): number | null => {
  if (!INTEGER_PATTERN.test(value)) return null

  const parsed = Number(value)
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null
}

const invalid = (
  code: Exclude<BuildCreateOrderRequestResult, { valid: true }>['code'],
  error: string
): BuildCreateOrderRequestResult => ({ valid: false, code, error })

const validateDelivery = (
  delivery: BuildCreateOrderRequestInput['delivery']
): OrderDeliveryPayload | null => {
  if (!delivery.valid) return null

  const { payload } = delivery
  if (
    payload.id_tipo_entrega === 1 &&
    payload.id_direccion_envio === null
  ) {
    return payload
  }

  if (
    payload.id_tipo_entrega === 2 &&
    Number.isSafeInteger(payload.id_direccion_envio) &&
    payload.id_direccion_envio > 0
  ) {
    return payload
  }

  return null
}

export const buildCreateOrderRequest = ({
  clienteUuid,
  delivery,
  lines
}: BuildCreateOrderRequestInput): BuildCreateOrderRequestResult => {
  if (!clienteUuid) {
    return invalid('client-required', 'Selecciona un cliente para crear el pedido.')
  }

  if (!UUID_PATTERN.test(clienteUuid)) {
    return invalid('invalid-client-uuid', 'El UUID del cliente no es válido.')
  }

  if (!delivery.valid) {
    return invalid(
      'delivery-invalid',
      delivery.reason === 'sector-required'
        ? 'Selecciona un sector de envío para continuar.'
        : 'El identificador del sector de envío no es válido.'
    )
  }

  const deliveryPayload = validateDelivery(delivery)
  if (!deliveryPayload) {
    return invalid('delivery-invalid', 'La modalidad o dirección de entrega no es válida.')
  }

  if (lines.length === 0) {
    return invalid('cart-empty', 'Agrega al menos un producto al pedido.')
  }

  if (lines.length > MAX_ORDER_LINES) {
    return invalid('cart-too-large', 'El pedido no puede tener más de 50 líneas.')
  }

  const products: CreateOrderProductRequest[] = []

  for (const line of lines) {
    const productId = toPositiveSafeInteger(line.producto.id)
    if (productId === null) {
      return invalid(
        'invalid-product-id',
        `El producto «${line.producto.producto_catalogo.nombre}» no tiene un ID numérico válido.`
      )
    }

    const preparationId = line.id_tipo_preparacion === null
      ? null
      : toPositiveSafeInteger(line.id_tipo_preparacion)
    if (line.id_tipo_preparacion !== null && preparationId === null) {
      return invalid(
        'invalid-preparation-id',
        `La preparación de «${line.producto.producto_catalogo.nombre}» no tiene un ID válido.`
      )
    }

    const quantityError = validateProductQuantity(
      String(line.cantidad),
      line.producto.unidad_venta
    )
    if (quantityError) {
      return invalid(
        'invalid-quantity',
        `Cantidad inválida para «${line.producto.producto_catalogo.nombre}»: ${quantityError}`
      )
    }

    const observations = line.observaciones ?? null
    if (
      observations !== null &&
      (typeof observations !== 'string' || observations.length > MAX_OBSERVATION_LENGTH)
    ) {
      return invalid(
        'invalid-observations',
        `Las observaciones de «${line.producto.producto_catalogo.nombre}» no pueden superar 255 caracteres.`
      )
    }

    products.push({
      id_producto_carniceria: productId,
      id_tipo_preparacion: preparationId,
      cantidad: line.cantidad,
      observaciones: observations
    })
  }

  return {
    valid: true,
    request: {
      cliente_uuid: clienteUuid,
      id_tipo_entrega: deliveryPayload.id_tipo_entrega,
      id_direccion_envio: deliveryPayload.id_direccion_envio,
      canal_origen: 'pos',
      productos: products
    }
  }
}
