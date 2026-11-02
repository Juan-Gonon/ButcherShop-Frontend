// src/router/AppRouter.tsx
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from '../store/hooks/useAuthStore'
import { LoginPage } from '../page/LoginPage'
import { NavigationMessagePage } from '../page/NavigationMessagePage'
import { NavigationPlaceholderPage } from '../page/NavigationPlaceholderPage'
import { CarniceriaLayout } from '../layouts/CarniceriaLayout'
import { DeliveryLayout } from '../layouts/DeliveryLayout'
import { SuperAdminLayout } from '../layouts/SuperAdminLayout'
import {
  AuthenticatedRedirect,
  InitialRouteRedirect,
  NotFoundRoute,
  RequireRoles
} from './RouteGuards'
import { CARNICERIA_ROLES, USER_ROLES } from './roles'

const ROLE_2_ONLY = [USER_ROLES.CARNICERIA_ADMIN] as const
const CARNICERIA_POS_ROLES = [
  USER_ROLES.CARNICERIA_ADMIN,
  USER_ROLES.OPERADOR,
  USER_ROLES.CAJERO
] as const

export const AppRouter = () => {
  const { status, renewLogin } = useAuthStore()

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
        <Route
          path='/auth/*'
          element={
            <AuthenticatedRedirect>
              <LoginPage />
            </AuthenticatedRedirect>
          }
        />
        <Route path='/' element={<InitialRouteRedirect />} />

        <Route
          path='/super-admin'
          element={
            <RequireRoles allowedRoles={[USER_ROLES.SUPER_ADMIN]}>
              <SuperAdminLayout />
            </RequireRoles>
          }
        >
          <Route index element={<NavigationPlaceholderPage title='Panel global' />} />
          <Route path='carnicerias' element={<NavigationPlaceholderPage title='Carnicerías' />} />
          <Route path='usuarios' element={<NavigationPlaceholderPage title='Usuarios globales' />} />
          <Route path='*' element={<NavigationMessagePage title='Página no encontrada' message='La ruta solicitada no existe.' />} />
        </Route>

        <Route
          path='/carniceria'
          element={
            <RequireRoles allowedRoles={CARNICERIA_ROLES}>
              <CarniceriaLayout />
            </RequireRoles>
          }
        >
          <Route
            index
            element={
              <RequireRoles allowedRoles={ROLE_2_ONLY}>
                <NavigationPlaceholderPage title='Inicio de carnicería' />
              </RequireRoles>
            }
          />
          <Route
            path='pos'
            element={
              <RequireRoles allowedRoles={CARNICERIA_POS_ROLES}>
                <NavigationPlaceholderPage title='Punto de venta' />
              </RequireRoles>
            }
          />
          <Route
            path='clientes'
            element={
              <RequireRoles allowedRoles={CARNICERIA_POS_ROLES}>
                <NavigationPlaceholderPage title='Clientes' />
              </RequireRoles>
            }
          />
          <Route
            path='productos'
            element={
              <RequireRoles allowedRoles={ROLE_2_ONLY}>
                <NavigationPlaceholderPage title='Productos' />
              </RequireRoles>
            }
          />
          <Route
            path='cortes'
            element={
              <RequireRoles allowedRoles={ROLE_2_ONLY}>
                <NavigationPlaceholderPage title='Cortes' />
              </RequireRoles>
            }
          />
          <Route
            path='personal-caja'
            element={
              <RequireRoles allowedRoles={ROLE_2_ONLY}>
                <NavigationPlaceholderPage title='Personal de caja' />
              </RequireRoles>
            }
          />
          <Route path='*' element={<NavigationMessagePage title='Página no encontrada' message='La ruta solicitada no existe.' />} />
        </Route>

        <Route
          path='/delivery'
          element={
            <RequireRoles allowedRoles={[USER_ROLES.REPARTIDOR]}>
              <DeliveryLayout />
            </RequireRoles>
          }
        >
          <Route index element={<NavigationPlaceholderPage title='Inicio de reparto' />} />
          <Route path='pedidos' element={<NavigationPlaceholderPage title='Pedidos de reparto' />} />
          <Route path='entregas' element={<NavigationPlaceholderPage title='Entregas' />} />
          <Route path='*' element={<NavigationMessagePage title='Página no encontrada' message='La ruta solicitada no existe.' />} />
        </Route>

        <Route path='*' element={<NotFoundRoute />} />
      </Routes>
    </BrowserRouter>
  )
}
