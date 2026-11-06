import { AppLayout } from '../components/layout/AppLayout'
import { useAuthStore } from '../store/hooks/useAuthStore'
import { getDeliveryLayoutConfig } from './config/deliveryLayoutConfig'

export const DeliveryLayout = () => {
  const { user } = useAuthStore()

  return <AppLayout config={getDeliveryLayoutConfig(user)} />
}
