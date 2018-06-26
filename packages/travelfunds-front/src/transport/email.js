import { get } from 'stores/TransportState'

export const getAll = () =>
  get('/api/emails')
    .then(x => x.json())

export const getHTML = id =>
  get(`/api/emails/${id}/html`)
    .then(x => x.text())
