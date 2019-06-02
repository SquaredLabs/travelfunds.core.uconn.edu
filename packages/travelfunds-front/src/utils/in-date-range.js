import { parseISO } from 'date-fns'

// Check if a date falls within a sequlize formatted PostgreSQL date range
export default (range, date) => {
  const left = parseISO(range[0].value)
  const right = parseISO(range[1].value)

  const withinLeftBoundary = range[0].inclusive
    ? date => left <= date
    : date => left < date

  const withinRightBoundary = range[1].inclusive
    ? date => date <= right
    : date => date < right

  return withinLeftBoundary(date) && withinRightBoundary(date)
}
