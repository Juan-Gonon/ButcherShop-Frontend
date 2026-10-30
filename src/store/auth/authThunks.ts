import type { Dispatch } from '@reduxjs/toolkit'
import {
  authService,
  renewAuthService
} from '../../features/auth/service/authService'
import { clearErrorMessage, onChecking, onLogin, onLogOut } from './authSlice'
import type { UserLogin } from '../../features/auth/types/interface'

export const startLogin = ({ user, password }: UserLogin) => {
  return async (dispatch: Dispatch) => {
    dispatch(onChecking())
    try {
      const data = await authService({ user, password })

      localStorage.setItem('token', data.token)
      localStorage.setItem('token-init-date', String(new Date().getTime()))

      dispatch(onLogin(data))

      return true
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error al iniciar sesión'
      console.error('Error en startLogin:', error)

      // Mandamos el error al estado global para que la pantalla de login lo muestre
      dispatch(onLogOut(errorMessage))

      // Limpiamos el error del estado
      setTimeout(() => {
        dispatch(clearErrorMessage())
      }, 5000)

      return false
    }
  }
}

export const checkAuthToken = () => {
  return async (dispatch: Dispatch) => {
    const token = localStorage.getItem('token')

    if (!token) {
      dispatch(onLogOut('Cerrando Sesión'))
      return
    }

    try {
      // servicio de renovación
      const data = await renewAuthService()

      // nuevo token
      localStorage.setItem('token', data.token)
      localStorage.setItem('token-init-date', String(new Date().getTime()))

      // Actualizamos el estado
      dispatch(onLogin(data))
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Sesión expirada'

      console.error('Error al renovar token:', error)

      dispatch(onLogOut(errorMessage))

      // Limpiamos los datos de autenticación del navegador
      localStorage.removeItem('token')
      localStorage.removeItem('token-init-date')

      // limpiar el mensaje de error
      setTimeout(() => {
        dispatch(clearErrorMessage())
      }, 5000)
    }
  }
}