// src/router/AppRouter.tsx
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from '../store/hooks/useAuthStore'
import { LoginPage } from '../page/LoginPage'
import { HomePage } from '../page/HomePage'
import { AdminPage } from '../page/AdminPage'
import { DeliveryPage } from '../page/DeliveryPage'

export const AppRouter = () => {
  const { status, user, renewLogin } = useAuthStore()

  useEffect(() => {
    renewLogin()
  }, [renewLogin])

  if (status === 'checking') {
    return (
      <div className='flex items-center justify-center min-h-screen bg-stone-900 text-white'>
        <div className='text-center space-y-2'>
          <div className='w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto'></div>
          <p className='text-sm text-stone-400'>Cargando sesión...</p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        {status === 'not-authenticated' ? (
          <>
            <Route path='/auth/*' element={<LoginPage />} />
            <Route path='*' element={<Navigate to='/auth/login' replace />} />
          </>
        ) : (
          // --- RUTAS PRIVADAS (SEGÚN EL ROL) ---
          <>
            {user?.id_rol === '1' && (
              <Route path='/admin' element={<AdminPage />} />
            )}
            {user?.id_rol === '2' && (
              <Route path='/carniceria/:uuid' element={<HomePage />} />
            )}
            {user?.id_rol === '4' && (
              <Route path='/delivery' element={<DeliveryPage />} />
            )}

            {/* Redirección por defecto según su rol*/}
            <Route
              path='*'
              element={
                <Navigate
                  to={
                    user?.id_rol === '1'
                      ? '/admin'
                      : user?.id_rol === '4'
                        ? '/delivery'
                        : `/carniceria/${user?.uuid}`
                  }
                  replace
                />
              }
            />
          </>
        )}
      </Routes>
    </BrowserRouter>
  )
}
