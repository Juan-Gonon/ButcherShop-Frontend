import type { NavigationItem } from '../../components/layout/types'
import type { UserRole } from '../../router/roles'

export const filterNavigationByRole = (
  navigation: readonly NavigationItem[],
  role: UserRole | null
): NavigationItem[] =>
  navigation.filter(
    (item) => !item.allowedRoles || (role !== null && item.allowedRoles.includes(role))
  )
