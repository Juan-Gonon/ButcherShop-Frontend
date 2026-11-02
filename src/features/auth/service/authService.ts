import api from '../../../lib/api/api'
import type {
  AuthResponse,
  AuthSuccess,
  UserLogin
} from '../types/interface'
import { isAxiosError } from 'axios'

const getSuccessfulAuthResponse = (data: AuthResponse): AuthSuccess => {
  if (!data.ok) {
    throw new Error(data.error)
  }

  return data
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

    return getSuccessfulAuthResponse(res.data)
  } catch (error) {
    console.error('Error en el servicio de autenticación:', error)

    if (isAxiosError(error)) {
      const serverMessage =
        error.response?.data?.error || 'Error al iniciar sesión'
      throw new Error(serverMessage, { cause: error })
    }

    throw new Error('Ocurrió un error inesperado', { cause: error })
  }
}

export const renewAuthService = async (): Promise<AuthSuccess> => {
  try {
    const res = await api.get<AuthResponse>('/auth/renew')

    return getSuccessfulAuthResponse(res.data)
  } catch (error) {
    console.error('Error en el servicio de autenticación:', error)

    if (isAxiosError(error)) {
      const serverMessage =
        error.response?.data?.error || 'Error al iniciar sesión'
      throw new Error(serverMessage, { cause: error })
    }

    throw new Error('Ocurrió un error inesperado', { cause: error })
  }
}
