import { get, post, patch, put } from 'stores/TransportState'

export const getAll = () =>
  get('/api/trips')
    .then(x => x.json())

export const getSingle = id =>
  get(`/api/trips/${id}`)
    .then(x => x.json())

export const getFairShareLeft = id =>
  get(`/api/trips/${id}/fairshareleft`)
    .then(x => x.text())

export const getBudgetAllocations = id =>
  get(`/api/trips/${id}/budget-allocations`)
    .then(x => x.json())

export const update = (id, body) =>
  patch(`/api/trips/${id}`, {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })

export const postGrants = (id, grants) =>
  put(`/api/trips/${id}/grants`, {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(grants)
  })

export const sendEmailUpdate = id =>
  post(`/api/trips/${id}/send-email-update`)
