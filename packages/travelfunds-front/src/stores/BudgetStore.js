import { observable, action, computed } from 'mobx'
import { groupBy } from 'lodash'
import { getAll, update } from 'transport/budget'

class BudgetStore {
  @observable fetching = false
  @observable budgets = []

  @action async fetch () {
    this.fetching = true
    try {
      var json = await getAll()
    } finally {
      this.fetching = false
    }
    this.budgets = json
      .sort((a, b) => a.id < b.id ? 1 : -1)
  }

  @action async update (id) {
    const budget = this.budgets.find(x => x.id === id)
    await update(budget)
  }

  @computed get fiscalYearMap () {
    return groupBy(this.budgets, 'fiscalYear')
  }

  byYear (year) {
    return this.fiscalYearMap[year]
  }
}

const singleton = new BudgetStore()
export default singleton
