import type { ReactNode } from 'react'
import type { To } from 'react-router-dom'
import type { IconType } from 'react-icons'
import type { UserRole } from '../../router/roles'

export interface NavigationItem {
  label: string
  to: To
  icon?: IconType
  allowedRoles?: readonly UserRole[]
}

export interface ModuleIdentity {
  name: string
  tagline?: string
  logo?: ReactNode
}

export interface HeaderContextItem {
  label: string
  value: ReactNode
  icon?: IconType
}

export interface HeaderUserInfo {
  name: string
  description?: string
  avatar?: ReactNode
}

export interface HeaderInfo {
  title: string
  subtitle?: string
  contextItems?: readonly HeaderContextItem[]
  user?: HeaderUserInfo
}

export interface HeaderAction {
  id: string
  label: string
  icon?: IconType
  onClick: () => void
  ariaLabel?: string
}

export interface AppLayoutConfig {
  module: ModuleIdentity
  navigation: readonly NavigationItem[]
  header: HeaderInfo
  headerActions?: readonly HeaderAction[]
}

export interface AppLayoutProps {
  config: AppLayoutConfig
}

