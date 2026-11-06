import {
  LuBriefcaseBusiness,
  LuLayoutDashboard,
  LuPackage,
  LuScissors,
  LuShoppingCart,
  LuStore,
  LuUsers
} from 'react-icons/lu'
import type { UserInfo } from '../../features/auth/types/interface'
import type { AppLayoutConfig, NavigationItem } from '../../components/layout/types'
import { filterNavigationByRole } from './filterNavigationByRole'
import { CARNICERIA_ROLES, getUserRole, USER_ROLES } from '../../router/roles'

const ADMIN_ONLY = [USER_ROLES.CARNICERIA_ADMIN] as const

const CARNICERIA_NAVIGATION: readonly NavigationItem[] = [
  {
    label: 'Panel principal',
    to: '/carniceria',
    icon: LuLayoutDashboard,
    allowedRoles: ADMIN_ONLY
  },
  {
    label: 'Punto de venta',
    to: '/carniceria/pos',
    icon: LuShoppingCart,
    allowedRoles: CARNICERIA_ROLES
  },
  {
    label: 'Clientes',
    to: '/carniceria/clientes',
    icon: LuUsers,
    allowedRoles: CARNICERIA_ROLES
  },
  {
    label: 'Mis productos y precios',
    to: '/carniceria/productos',
    icon: LuPackage,
    allowedRoles: ADMIN_ONLY
  },
  {
    label: 'Cortes y preparaciones',
    to: '/carniceria/cortes',
    icon: LuScissors,
    allowedRoles: ADMIN_ONLY
  },
  {
    label: 'Personal y caja',
    to: '/carniceria/personal-caja',
    icon: LuBriefcaseBusiness,
    allowedRoles: ADMIN_ONLY
  }
]

export const getCarniceriaLayoutConfig = (
  user: UserInfo | null
): AppLayoutConfig => {
  const role = getUserRole(user?.id_rol)

  return {
    module: {
      name: 'Carnicería',
      tagline: 'Gestión de carnicería',
      logo: <LuStore aria-hidden='true' className='h-5 w-5' />
    },
    navigation: filterNavigationByRole(CARNICERIA_NAVIGATION, role),
    header: {
      title: 'Carnicería',
      user: user ? { name: user.nombre } : undefined
    }
  }
}

