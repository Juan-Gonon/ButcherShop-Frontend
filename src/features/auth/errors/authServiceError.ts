import { isAxiosError, isCancel } from 'axios'
import type { AuthError } from '../types/interface'

export type AuthServiceErrorCategory =
  | 'authentication'
  | 'authorization'
  | 'validation'
  | 'not-found'
  | 'server'
  | 'timeout'
  | 'network'
  | 'http'
  | 'application'
  | 'unexpected'

interface AuthServiceErrorOptions {
  status?: number
  code?: string
  backendError?: AuthError
  backendMessage?: string
  category?: AuthServiceErrorCategory
  isNetworkError?: boolean
}

export class AuthServiceError extends Error {
  readonly status?: number
  readonly code?: string
  readonly backendError?: AuthError
  readonly backendMessage?: string
  readonly category: AuthServiceErrorCategory
  readonly isNetworkError: boolean

  constructor(message: string, options: AuthServiceErrorOptions = {}) {
    super(message)
    this.name = 'AuthServiceError'
    this.status = options.status
    this.code = options.code
    this.backendError = options.backendError
    this.backendMessage = options.backendMessage
    this.category = options.category ?? 'unexpected'
    this.isNetworkError = options.isNetworkError ?? false
  }
}

const getAuthErrorPayload = (data: unknown): AuthError | undefined => {
  if (
    typeof data === 'object' &&
    data !== null &&
    'ok' in data &&
    data.ok === false &&
    'error' in data &&
    typeof data.error === 'string'
  ) {
    return { ok: false, error: data.error }
  }

  return undefined
}

const getBackendMessage = (data: unknown): string | undefined => {
  if (
    typeof data === 'object' &&
    data !== null &&
    'error' in data &&
    typeof data.error === 'string'
  ) {
    return data.error
  }

  return undefined
}

const getErrorCategory = (
  status: number | undefined,
  code: string | undefined,
  isNetworkError: boolean
): AuthServiceErrorCategory => {
  if (status === 401) return 'authentication'
  if (status === 403) return 'authorization'
  if (status === 400) return 'validation'
  if (status === 404) return 'not-found'
  if (status !== undefined && status >= 500 && status < 600) return 'server'
  if (code === 'ECONNABORTED' || code === 'ETIMEDOUT') return 'timeout'
  if (isNetworkError) return 'network'
  if (status !== undefined) return 'http'
  return 'unexpected'
}

export const normalizeAuthServiceError = (
  error: unknown,
  fallbackMessage: string
): AuthServiceError => {
  if (error instanceof AuthServiceError) {
    return error
  }

  if (isAxiosError(error)) {
    const status = error.response?.status
    const backendMessage = getBackendMessage(error.response?.data)
    const isNetworkError =
      !error.response &&
      !isCancel(error) &&
      (Boolean(error.request) || error.code === 'ERR_NETWORK')

    return new AuthServiceError(backendMessage ?? fallbackMessage, {
      status,
      code: error.code,
      backendError: getAuthErrorPayload(error.response?.data),
      backendMessage,
      category: getErrorCategory(status, error.code, isNetworkError),
      isNetworkError
    })
  }

  return new AuthServiceError(fallbackMessage, { category: 'unexpected' })
}
