import { useKdsOrders } from './useKdsOrders'

export const useConfirmedOrders = (pageSize = 20, page = 1) =>
  useKdsOrders('Confirmado', pageSize, page)