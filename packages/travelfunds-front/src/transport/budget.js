import { get, put } from 'stores/TransportState'

export const getAll = () =>
  get('/api/budgets')
    .then(x => x.json())

export const update = budget =>
  put('/api/budgets/' + budget.id, {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(budget)
  })
