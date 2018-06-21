import { post } from 'stores/TransportState'
import { format } from 'date-fns'
const { Headers } = window

export function submit (payload) {
  const contact = {
    contactEmail: payload.contact.email
  }

  const travelDetails = {
    ...payload.travelDetails,
    startDate: format(payload.travelDetails.startDate, 'YYYY-MM-DD'),
    endDate: format(payload.travelDetails.endDate, 'YYYY-MM-DD')
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
    headers: new Headers({
      'Content-Type': 'application/json'
    }),
    credentials: 'same-origin',
    body: JSON.stringify(body)
  })
}
