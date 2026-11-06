import { AppLayout } from '../components/layout/AppLayout'
import { useAuthStore } from '../store/hooks/useAuthStore'
import { getCarniceriaLayoutConfig } from './config/carniceriaLayoutConfig'

export const CarniceriaLayout = () => {
  const { user } = useAuthStore()

  return <AppLayout config={getCarniceriaLayoutConfig(user)} />
}
