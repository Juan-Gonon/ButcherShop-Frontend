import type { Dispatch } from '@reduxjs/toolkit'
import {
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
import { AuthServiceError } from '../../features/auth/errors/authServiceError'

let authCheckPromise: Promise<void> | null = null

const clearStoredSession = () => {
  for (const key of ['token', 'token-init-date']) {
    try {
      localStorage.removeItem(key)
    } catch {
      console.error('No se pudo eliminar una clave de sesión almacenada')
    }
  }
}

const getRenewalErrorKind = (
  error: unknown
): 'invalid-session' | 'temporary' | 'unexpected' => {
  if (!(error instanceof AuthServiceError)) {
    return 'unexpected'
  }

  switch (error.category) {
  case 'authentication':
  case 'authorization':
    return 'invalid-session'
  case 'server':
  case 'timeout':
  case 'network':
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

const getSafeErrorContext = (error: unknown) => {
  if (!(error instanceof AuthServiceError)) {
    return { category: 'unexpected' as const }
  }

  return {
    category: error.category,
    ...(error.status !== undefined ? { status: error.status } : {}),
    ...(error.code ? { code: error.code } : {})
  }
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
        error instanceof AuthServiceError && error.message
          ? error.message
          : 'No se pudo iniciar sesión. Verifica tus datos e inténtalo de nuevo.'
      console.error('Error de login', getSafeErrorContext(error))

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
    } catch {
      dispatch(
        onVerificationError({
          message: 'No se pudo comprobar la sesión almacenada.',
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
      }, 500)

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
      const errorKind = getRenewalErrorKind(error)
      const errorMessage =
        errorKind === 'invalid-session'
          ? 'Tu sesión expiró o dejó de ser válida. Inicia sesión nuevamente.'
          : errorKind === 'temporary'
            ? 'No se pudo verificar la sesión. Inténtalo de nuevo más tarde.'
            : 'No se pudo verificar la sesión.'

      console.error('Error al renovar sesión', getSafeErrorContext(error))

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
