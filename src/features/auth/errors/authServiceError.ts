import type { AuthError } from '../types/interface'

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