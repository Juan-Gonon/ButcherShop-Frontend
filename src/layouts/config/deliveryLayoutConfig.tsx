import { LuClipboardList, LuHouse, LuPackageCheck, LuTruck } from 'react-icons/lu'
import type { UserInfo } from '../../features/auth/types/interface'
import type { AppLayoutConfig, NavigationItem } from '../../components/layout/types'
import { filterNavigationByRole } from './filterNavigationByRole'
import { getUserRole, USER_ROLES } from '../../router/roles'

const DELIVERY_ONLY = [USER_ROLES.REPARTIDOR] as const

const DELIVERY_NAVIGATION: readonly NavigationItem[] = [
  {
    label: 'Inicio de reparto',
    to: '/delivery',
    icon: LuHouse,
    allowedRoles: DELIVERY_ONLY
  },
  {
    label: 'Pedidos',
    to: '/delivery/pedidos',
    icon: LuClipboardList,
    allowedRoles: DELIVERY_ONLY
  },
  {
    label: 'Entregas',
    to: '/delivery/entregas',
    icon: LuPackageCheck,
    allowedRoles: DELIVERY_ONLY
  }
]

export const getDeliveryLayoutConfig = (
  user: UserInfo | null
): AppLayoutConfig => {
  const role = getUserRole(user?.id_rol)

  return {
    module: {
      name: 'Delivery',
      tagline: 'Operación de reparto',
      logo: <LuTruck aria-hidden='true' className='h-5 w-5' />
    },
    navigation: filterNavigationByRole(DELIVERY_NAVIGATION, role),
    header: {
      title: 'Reparto',
      user: user ? { name: user.nombre } : undefined
    }
  }
}

