import { LuLayoutDashboard, LuShieldCheck, LuStore, LuUsers } from 'react-icons/lu'
import type { UserInfo } from '../../features/auth/types/interface'
import type { AppLayoutConfig, NavigationItem } from '../../components/layout/types'
import { filterNavigationByRole } from './filterNavigationByRole'
import { getUserRole, USER_ROLES } from '../../router/roles'

const SUPER_ADMIN_ONLY = [USER_ROLES.SUPER_ADMIN] as const

const SUPER_ADMIN_NAVIGATION: readonly NavigationItem[] = [
  {
    label: 'Panel global',
    to: '/super-admin',
    icon: LuLayoutDashboard,
    allowedRoles: SUPER_ADMIN_ONLY
  },
  {
    label: 'Carnicerías',
    to: '/super-admin/carnicerias',
    icon: LuStore,
    allowedRoles: SUPER_ADMIN_ONLY
  },
  {
    label: 'Usuarios globales',
    to: '/super-admin/usuarios',
    icon: LuUsers,
    allowedRoles: SUPER_ADMIN_ONLY
  }
]

export const getSuperAdminLayoutConfig = (
  user: UserInfo | null
): AppLayoutConfig => {
  const role = getUserRole(user?.id_rol)

  return {
    module: {
      name: 'Super Admin',
      tagline: 'Administración global',
      logo: <LuShieldCheck aria-hidden='true' className='h-5 w-5' />
    },
    navigation: filterNavigationByRole(SUPER_ADMIN_NAVIGATION, role),
    header: {
      title: 'Panel global',
      user: user ? { name: user.nombre } : undefined
    }
  }
}

