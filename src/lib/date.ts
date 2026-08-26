/**
 * Parse YYYY-MM-DD without timezone shift.
 */
export function parseISODateParts(isoDate: string): { year: number; month: number; day: number } {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate)
  if (!match) {
    throw new Error(`Invalid ISO date: ${isoDate}`)
  }

  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  }
}

const MONTH_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const

/** Blog list: "Aug 26" */
export function formatBlogListDate(isoDate: string): string {
  const { month, day } = parseISODateParts(isoDate)
  return `${MONTH_SHORT[month - 1]} ${day}`
}

/** Blog detail: "Aug 26, 2026" */
export function formatBlogDetailDate(isoDate: string): string {
  const { year, month, day } = parseISODateParts(isoDate)
  return `${MONTH_SHORT[month - 1]} ${day}, ${year}`
}

export function getYearFromISODate(isoDate: string): number {
  return parseISODateParts(isoDate).year
}
