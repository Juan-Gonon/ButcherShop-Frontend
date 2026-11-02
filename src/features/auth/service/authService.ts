import api from '../../../lib/api/api'
import type {
  AuthError,
  AuthResponse,
  AuthSuccess,
  UserLogin
} from '../types/interface'
import { isAxiosError, isCancel } from 'axios'

interface AuthServiceErrorOptions {
  status?: number
  code?: string
  backendError?: AuthError
  isNetworkError?: boolean
  cause?: unknown
}

export class AuthServiceError extends Error {
  readonly status?: number
  readonly code?: string
  readonly backendError?: AuthError
  readonly isNetworkError: boolean

  constructor(message: string, options: AuthServiceErrorOptions = {}) {
    super(message, { cause: options.cause })
    this.name = 'AuthServiceError'
    this.status = options.status
    this.code = options.code
    this.backendError = options.backendError
    this.isNetworkError = options.isNetworkError ?? false
  }
}

const getSuccessfulAuthResponse = (
  data: AuthResponse,
  status: number
): AuthSuccess => {
  if (!data.ok) {
    throw new AuthServiceError(data.error, {
      status,
      backendError: data
    })
  }

  return data
}

const normalizeAuthError = (
  error: unknown,
  fallbackMessage: string
): AuthServiceError => {
  if (error instanceof AuthServiceError) {
    return error
  }

  if (isAxiosError<AuthResponse>(error)) {
    const responseData = error.response?.data
    const backendError = responseData && !responseData.ok
      ? responseData
      : undefined

    return new AuthServiceError(backendError?.error || fallbackMessage, {
      status: error.response?.status,
      code: error.code,
      backendError,
      isNetworkError:
        Boolean(error.request) && !error.response && !isCancel(error),
      cause: error
    })
  }

  return new AuthServiceError(fallbackMessage, { cause: error })
}

export const authService = async ({
  user,
  password
}: UserLogin): Promise<AuthSuccess> => {
  try {
    const res = await api.post<AuthResponse>('/auth/', {
      usuario: user,
      password: password
    })

    return getSuccessfulAuthResponse(res.data, res.status)
  } catch (error) {
    console.error('Error en el servicio de autenticación:', error)

    if (error instanceof AuthServiceError) {
      throw error
    }

    if (isAxiosError<AuthResponse>(error)) {
      const serverMessage =
        error.message || 'Error al iniciar sesión'
      throw normalizeAuthError(error, serverMessage)
    }

    throw new Error('Ocurrió un error inesperado', { cause: error })
  }
}

export const renewAuthService = async (): Promise<AuthSuccess> => {
  try {
    const res = await api.get<AuthResponse>('/auth/renew')

    return getSuccessfulAuthResponse(res.data, res.status)
  } catch (error) {
    console.error('Error en el servicio de autenticación:', error)

    if (error instanceof AuthServiceError) {
      throw error
    }

    if (isAxiosError<AuthResponse>(error)) {
      const serverMessage =
        error.message || 'Error al iniciar sesión'
      throw normalizeAuthError(error, serverMessage)
    }

    throw new Error('Ocurrió un error inesperado', { cause: error })
  }
}
