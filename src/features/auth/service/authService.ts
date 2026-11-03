import api from '../../../lib/api/api'
import {
  AuthServiceError,
  normalizeAuthServiceError
} from '../errors/authServiceError'
import type { AxiosResponse } from 'axios'
import type { AuthResponse, AuthSuccess, UserLogin } from '../types/interface'

const requestAuthSuccess = async (
  request: () => Promise<AxiosResponse<AuthResponse>>,
  fallbackMessage: string
): Promise<AuthSuccess> => {
  try {
    const { data, status } = await request()

    if (!data.ok) {
      throw new AuthServiceError(data.error, {
        status,
        backendError: data,
        backendMessage: data.error,
        category: 'application'
      })
    }

    return data
  } catch (error) {
    throw normalizeAuthServiceError(error, fallbackMessage)
  }
}

export const authService = async ({
  user,
  password
}: UserLogin): Promise<AuthSuccess> => {
  return requestAuthSuccess(
    () => api.post<AuthResponse>('/auth/', {
      usuario: user,
      password: password
    }),
    'Error al iniciar sesión'
  )
}

export const renewAuthService = async (): Promise<AuthSuccess> => {
  return requestAuthSuccess(
    () => api.get<AuthResponse>('/auth/renew'),
    'Error al iniciar sesión'
  )
}
