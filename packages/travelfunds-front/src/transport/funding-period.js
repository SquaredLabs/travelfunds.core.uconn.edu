import { get, put } from 'stores/TransportState'

export const getAll = () =>
  get('/api/funding-periods')
    .then(x => x.json())

export const getActive = () =>
  get('/api/funding-periods/active')
    .then(x => x.json())

export const update = fundingPeriod =>
  put('/api/funding-periods/' + fundingPeriod.id, {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fundingPeriod)
  })
