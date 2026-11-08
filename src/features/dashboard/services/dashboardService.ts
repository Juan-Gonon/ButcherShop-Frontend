import api from '../../../lib/api/api'
import type {
  DashboardSummaryData,
  DashboardSummaryParams,
  DashboardSummaryResponse
} from '../types/dashboard'

export const getDashboardSummary = async (
  params: DashboardSummaryParams
): Promise<DashboardSummaryData> => {
  const response = await api.get<DashboardSummaryResponse>(
    '/api/reports/summary',
    { params }
  )

  return response.data.data
}
