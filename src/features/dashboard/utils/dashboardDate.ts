import type {
  DashboardPeriod,
  DashboardSummaryParams
} from '../types/dashboard'

const BUSINESS_TIME_ZONE = 'America/Guatemala'

const businessDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: BUSINESS_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
})

const getBusinessDateParts = (instant: Date) => {
  const parts = businessDateFormatter.formatToParts(instant)
  const year = Number(parts.find((part) => part.type === 'year')?.value)
  const month = Number(parts.find((part) => part.type === 'month')?.value)
  const day = Number(parts.find((part) => part.type === 'day')?.value)

  return { year, month, day }
}

const formatDateParts = (year: number, month: number, day: number) =>
  `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`

export const getDashboardDateRange = (
  period: DashboardPeriod,
  instant: Date = new Date()
): DashboardSummaryParams => {
  const { year, month, day } = getBusinessDateParts(instant)
  let businessDate = formatDateParts(year, month, day)

  if (period === 'ayer') {
    const previousDay = new Date(Date.UTC(year, month - 1, day - 1))
    businessDate = formatDateParts(
      previousDay.getUTCFullYear(),
      previousDay.getUTCMonth() + 1,
      previousDay.getUTCDate()
    )
  }

  return { desde: businessDate, hasta: businessDate }
}
