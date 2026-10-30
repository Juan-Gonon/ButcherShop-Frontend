import { useDispatch, useSelector } from 'react-redux'
import { checkAuthToken, startLogin } from '../auth/authThunks'
import { onLogOut as logoutAction } from '../auth/authSlice' // Renombramos para evitar conflictos
import type { AppDispatch, RootState } from '..'
import type { UserLogin } from '../../features/auth/types/interface'

export const useAuthStore = () => {
  const { status, user, token, errorMessage } = useSelector((state: RootState) => state.auth)
  
  // Thunks asíncronos
  const dispatch = useDispatch<AppDispatch>()

  const starLogin = async (credentials: UserLogin) => {
    return await dispatch(startLogin(credentials))
  }

  const renewLogin = async () => {
    return await dispatch(checkAuthToken())
  }

  const startLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('token-init-date')
    dispatch(logoutAction('Cerrando sesión'))
  }

  return {
    // Propiedades del estado
    status,
    user,
    token,
    errorMessage,
    
    // Métodos (Acciones / Thunks)
    starLogin,
    renewLogin,
    onLogOut: startLogout
  }
}