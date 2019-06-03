import { get, post } from 'stores/TransportState'

export const getAll = () =>
  get('/api/fiscal-years')
    .then(x => x.json())

export const setup = year =>
  post(`/api/fiscal-years/${year}/setup`)
