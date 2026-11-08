import api from '../../../lib/api/api'
import type {
  DashboardSummaryData,
  DashboardSummaryParams,
  DashboardSummaryResponse
} from '../types/dashboard'

export const getDashboardSummary = async (
  params: DashboardSummaryParams,
  signal?: AbortSignal
): Promise<DashboardSummaryData> => {
  const response = await api.get<DashboardSummaryResponse>('/reports/summary', {
    params,
    signal
  })

  return response.data.data
}
