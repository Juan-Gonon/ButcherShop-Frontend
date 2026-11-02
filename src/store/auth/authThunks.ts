import type { Dispatch } from '@reduxjs/toolkit'
import {
  authService,
  renewAuthService
} from '../../features/auth/service/authService'
import { clearErrorMessage, onChecking, onLogin, onLogOut } from './authSlice'
import type { UserLogin } from '../../features/auth/types/interface'
import type { AppDispatch } from '..'

let authCheckPromise: Promise<void> | null = null

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

const checkAuthTokenOnce = () => {
  return async (dispatch: Dispatch) => {
    dispatch(onChecking())
    let token: string | null
    try {
      token = localStorage.getItem('token')
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Session expired'
      dispatch(onLogOut(errorMessage))
      return
    }

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

export const checkAuthToken = () => {
  return (dispatch: AppDispatch) => {
    if (authCheckPromise) {
      return authCheckPromise
    }

    authCheckPromise = Promise.resolve(dispatch(checkAuthTokenOnce()))
      .then(() => undefined)
      .finally(() => {
        authCheckPromise = null
      })

    return authCheckPromise
  }
}
