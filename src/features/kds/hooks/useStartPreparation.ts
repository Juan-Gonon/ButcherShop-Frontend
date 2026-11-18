import { isAxiosError } from 'axios'
import { useCallback, useRef, useState } from 'react'
import { transitionOrderState } from '../services/kdsService'

const getTransitionErrorMessage = (error: unknown): string => {
  if (isAxiosError<{ error?: unknown }>(error)) {
    if (error.response?.status === 409) {
      return 'El pedido pudo haber cambiado de estado o la transici\u00F3n no est\u00E1 permitida. Actualiza la lista antes de volver a intentarlo.'
    }

    const backendMessage = error.response?.data?.error
    if (typeof backendMessage === 'string' && backendMessage.trim()) {
      return backendMessage
    }

    if (!error.response) {
      return 'No se pudo conectar con el servidor. Comprueba la conexi\u00F3n e int\u00E9ntalo de nuevo.'
    }
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return 'No se pudo comenzar la preparaci\u00F3n. Int\u00E9ntalo de nuevo.'
}

export const useStartPreparation = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [started, setStarted] = useState(false)
  const requestInFlight = useRef(false)

  const startPreparation = useCallback(async (uuid: string): Promise<boolean> => {
    if (requestInFlight.current) return false

    requestInFlight.current = true
    setLoading(true)
    setError(null)

    try {
      await transitionOrderState(uuid, {
        estado_actual_esperado: 'Confirmado',
        estado_destino: 'En preparaci\u00F3n'
      })
      setStarted(true)
      return true
    } catch (requestError: unknown) {
      setError(getTransitionErrorMessage(requestError))
      return false
    } finally {
      requestInFlight.current = false
      setLoading(false)
    }
  }, [])

  return { startPreparation, loading, error, started }
}