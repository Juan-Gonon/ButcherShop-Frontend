import type { Dispatch } from '@reduxjs/toolkit'
import {
  AuthServiceError,
  authService,
  renewAuthService
} from '../../features/auth/service/authService'
import {
  clearErrorMessage,
  onChecking,
  onLogin,
  onLogOut,
  onVerificationError
} from './authSlice'
import type { UserLogin } from '../../features/auth/types/interface'
import type { AppDispatch } from '..'

let authCheckPromise: Promise<void> | null = null

const clearStoredSession = () => {
  for (const key of ['token', 'token-init-date']) {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error al eliminar ${key} de la sesión:`, error)
    }
  }
}

const getRenewalErrorKind = (
  error: unknown
): 'invalid-session' | 'temporary' | 'unexpected' => {
  if (!(error instanceof AuthServiceError)) {
    return 'unexpected'
  }

  if (
    error.status === 401 ||
    error.status === 403
  ) {
    return 'invalid-session'
  }

  if (
    (error.status !== undefined && error.status >= 500 && error.status < 600) ||
    error.isNetworkError ||
    error.code === 'ECONNABORTED' ||
    error.code === 'ETIMEDOUT'
  ) {
    return 'temporary'
  }

  if (
    error.backendError?.error === 'Invalid or expired token' ||
    error.backendError?.error === 'No token provider'
  ) {
    return 'invalid-session'
  }

  return 'unexpected'
}

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
      clearStoredSession()

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
      dispatch(
        onVerificationError({
          message: errorMessage,
          kind: 'unexpected'
        })
      )
      return
    }

    if (!token) {
      clearStoredSession()
      dispatch(onLogOut('Cerrando Sesión'))
      setTimeout(() => {
        dispatch(clearErrorMessage())
      }, 1000)

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
      const errorKind = getRenewalErrorKind(error)

      if (errorKind === 'invalid-session') {
        dispatch(onLogOut(errorMessage))
        clearStoredSession()
      } else {
        dispatch(
          onVerificationError({
            message: errorMessage,
            kind: errorKind
          })
        )
      }

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

export const logoutAction = () => {
  return (dispatch: AppDispatch) => {
    clearStoredSession()
    dispatch(onLogOut('Cerrando sesión'))
    setTimeout(() => {
      dispatch(clearErrorMessage())
    }, 1000)
  }
}
