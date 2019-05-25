import { get } from 'stores/TransportState'

export const getAll = () =>
  get('/api/fiscal-years')
    .then(x => x.json())
