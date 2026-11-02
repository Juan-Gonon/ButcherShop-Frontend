import type { ReactNode } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/hooks/useAuthStore'
import type { UserInfo } from '../features/auth/types/interface'
import { NavigationMessagePage } from '../page/NavigationMessagePage'
import {
  getInitialPath,
  getUserRole,
  isCarniceriaRole,
  type UserRole
} from './roles'

type UserAccess =
  | { allowed: true; role: UserRole }
  | { allowed: false; reason: 'incomplete' | 'unknown-role' }
type UserAccessFailure = Extract<UserAccess, { allowed: false }>

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0

const isValidUserUuid = (value: unknown): value is string =>
  isNonEmptyString(value) &&
  /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(value.trim())

const getUserAccess = (user: UserInfo | null): UserAccess => {
  if (!user || !isValidUserUuid(user.uuid)) {
    return { allowed: false, reason: 'incomplete' }
  }

  const role = getUserRole(user.id_rol)
  if (!role) {
    return { allowed: false, reason: 'unknown-role' }
  }

  if (isCarniceriaRole(role) && !isNonEmptyString(user.id_carniceria)) {
    return { allowed: false, reason: 'incomplete' }
  }

  return { allowed: true, role }
}

const UserAccessMessage = ({ reason }: { reason: UserAccessFailure['reason'] }) => (
  <NavigationMessagePage
    title={reason === 'incomplete' ? 'Datos de usuario incompletos' : 'Acceso no autorizado'}
    message={
      reason === 'incomplete'
        ? 'No se puede abrir una interfaz privada porque faltan datos requeridos de la sesión.'
        : 'El rol de esta cuenta no está reconocido para la navegación disponible.'
    }
    showLogout
  />
)

interface RequireRolesProps {
  allowedRoles: readonly UserRole[]
  children?: ReactNode
}

export const RequireRoles = ({
  allowedRoles,
  children
}: RequireRolesProps) => {
  const { status, user } = useAuthStore()

  if (status !== 'authenticated') {
    return <Navigate to='/auth/login' replace />
  }

  const access = getUserAccess(user)
  if (access.allowed === false) {
    return <UserAccessMessage reason={access.reason} />
  }

  if (!allowedRoles.includes(access.role)) {
    return <Navigate to={getInitialPath(access.role)} replace />
  }

  return children ?? <Outlet />
}

interface AuthenticatedRedirectProps {
  children: ReactNode
}

export const AuthenticatedRedirect = ({
  children
}: AuthenticatedRedirectProps) => {
  const { status, user } = useAuthStore()

  if (status !== 'authenticated') {
    return <>{children}</>
  }

  const access = getUserAccess(user)
  if (access.allowed === false) {
    return <UserAccessMessage reason={access.reason} />
  }

  return <Navigate to={getInitialPath(access.role)} replace />
}

export const InitialRouteRedirect = () => {
  const { status, user } = useAuthStore()

  if (status !== 'authenticated') {
    return <Navigate to='/auth/login' replace />
  }

  const access = getUserAccess(user)
  if (access.allowed === false) {
    return <UserAccessMessage reason={access.reason} />
  }

  return <Navigate to={getInitialPath(access.role)} replace />
}

export const NotFoundRoute = () => {
  const { status, user } = useAuthStore()

  if (status !== 'authenticated') {
    return <Navigate to='/auth/login' replace />
  }

  const access = getUserAccess(user)
  if (access.allowed === false) {
    return <UserAccessMessage reason={access.reason} />
  }

  return (
    <NavigationMessagePage
      title='Página no encontrada'
      message='La ruta solicitada no existe.'
    />
  )
}
