import type { Dispatch } from '@reduxjs/toolkit'
import { authService } from '../../features/auth/service/authService'
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
      const errorMessage = error instanceof Error ? error.message : 'Error al iniciar sesión'
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