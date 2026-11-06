import { AppLayout } from '../components/layout/AppLayout'
import { useAuthStore } from '../store/hooks/useAuthStore'
import { getSuperAdminLayoutConfig } from './config/superAdminLayoutConfig'

export const SuperAdminLayout = () => {
  const { user } = useAuthStore()

  return <AppLayout config={getSuperAdminLayoutConfig(user)} />
}
