import api from '../../../lib/api/api'
import type { UserLogin, AuthResponse } from '../types/interface'
import { isAxiosError } from 'axios'

export const authService = async ({
  user,
  password
}: UserLogin): Promise<AuthResponse> => {
  try {
    const res = await api.post<AuthResponse>('/auth/', {
      usuario: user,
      password: password
    })

    return res.data
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