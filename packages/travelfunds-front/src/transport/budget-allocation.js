import { put } from 'stores/TransportState'

export const update = budgetAllocation =>
  put('/api/budget-allocations/' + budgetAllocation.id, {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(budgetAllocation)
  })
