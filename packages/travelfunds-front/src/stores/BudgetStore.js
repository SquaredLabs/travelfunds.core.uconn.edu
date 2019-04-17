import { observable, action } from 'mobx'
import { getAll, update } from 'transport/budget'

class Budgets {
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
    var res = await update(budget)
    return res
  }
}

const singleton = new Budgets()
export default singleton
