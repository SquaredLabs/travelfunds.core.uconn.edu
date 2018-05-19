import { post } from 'stores/TransportState'
import { toISODateString } from 'utils'
const { Headers } = window

export function submit (payload) {
  const contact = Object.keys(payload.contact)
    .reduce((acc, key) => {
      return payload.contact[key] !== ''
        ? { ...acc, [key]: payload.contact[key] }
        : acc
    }, {})

  const travelDetails = {
    ...payload.travelDetails,
    startDate: toISODateString(payload.travelDetails.startDate),
    endDate: toISODateString(payload.travelDetails.endDate)
  }

  const travelCosts = Object.keys(payload.travelCosts)
    .reduce((acc, key) => ({
      ...acc,
      [key]: payload.travelCosts[key] || 0
    }), {})

  payload = { ...payload, contact, travelDetails, travelCosts }

  return post('/travelrequests', {
    headers: new Headers({
      'Content-Type': 'application/json'
    }),
    credentials: 'same-origin',
    body: JSON.stringify(payload)
  })
}
