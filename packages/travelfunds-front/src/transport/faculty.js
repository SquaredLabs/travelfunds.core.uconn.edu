import { get } from 'stores/TransportState'
const { Headers } = window

export function getSuggestions (name) {
  return get(`${process.env.KENNEL_BASE_URL}searchByName?q=${name}`, {
    method: 'GET',
    headers: new Headers({
      'Authorization': `Bearer ${process.env.KENNEL_TOKEN}`
    })
  })
}

export function getFairShareLeft (netid) {
  return get(`/api/faculty/${netid}/fair-share-left/`)
}
