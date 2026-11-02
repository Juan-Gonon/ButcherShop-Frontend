import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { checkAuthToken, startLogin, logoutAction } from '../auth/authThunks'
import type { AppDispatch, RootState } from '..'
import type { UserLogin } from '../../features/auth/types/interface'

export const useAuthStore = () => {
  const { status, user, token, errorMessage, verificationErrorKind } =
    useSelector((state: RootState) => state.auth)
  
  // Thunks asíncronos
  const dispatch = useDispatch<AppDispatch>()

  const starLogin = async (credentials: UserLogin) => {
    return await dispatch(startLogin(credentials))
  }

  const renewLogin = useCallback(
    () => dispatch(checkAuthToken()),
    [dispatch]
  )

  const startLogout = () => {
    dispatch(logoutAction())
  }

  return {
    // Propiedades del estado
    status,
    user,
    token,
    errorMessage,
    verificationErrorKind,
    
    // Métodos (Acciones / Thunks)
    starLogin,
    renewLogin,
    onLogOut: startLogout
  }
}
