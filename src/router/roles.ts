export const USER_ROLES = {
  SUPER_ADMIN: '1',
  CARNICERIA_ADMIN: '2',
  OPERADOR: '3',
  REPARTIDOR: '4',
  CAJERO: '5'
} as const

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES]

export const CARNICERIA_ROLES = [
  USER_ROLES.CARNICERIA_ADMIN,
  USER_ROLES.OPERADOR,
  USER_ROLES.CAJERO
] as const satisfies readonly UserRole[]

const INITIAL_PATH_BY_ROLE: Record<UserRole, string> = {
  [USER_ROLES.SUPER_ADMIN]: '/super-admin',
  [USER_ROLES.CARNICERIA_ADMIN]: '/carniceria',
  [USER_ROLES.OPERADOR]: '/carniceria/pos',
  [USER_ROLES.REPARTIDOR]: '/delivery',
  [USER_ROLES.CAJERO]: '/carniceria/pos'
}

export const getUserRole = (idRol: string | null | undefined): UserRole | null => {
  switch (idRol) {
  case USER_ROLES.SUPER_ADMIN:
  case USER_ROLES.CARNICERIA_ADMIN:
  case USER_ROLES.OPERADOR:
  case USER_ROLES.REPARTIDOR:
  case USER_ROLES.CAJERO:
    return idRol
  default:
    return null
  }
}

export const getInitialPath = (role: UserRole): string =>
  INITIAL_PATH_BY_ROLE[role]

export const isCarniceriaRole = (role: UserRole): boolean =>
  CARNICERIA_ROLES.some((carniceriaRole) => carniceriaRole === role)
