import { post } from 'stores/TransportState'
import { format } from 'date-fns'

export function submit (payload) {
  const contact = {
    contactEmail: payload.contact.email
  }

  const travelDetails = {
    ...payload.travelDetails,
    startDate: format(payload.travelDetails.startDate, 'yyyy-MM-dd'),
    endDate: format(payload.travelDetails.endDate, 'yyyy-MM-dd')
  }

  const travelCosts = Object.keys(payload.travelCosts)
    .reduce((acc, key) => ({
      ...acc,
      [key]: payload.travelCosts[key] || 0
    }), {})

  const body = {
    ...contact,
    ...payload.traveler,
    ...travelDetails,
    ...travelCosts
  }

  return post('/api/trips', {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(body)
  })
}
