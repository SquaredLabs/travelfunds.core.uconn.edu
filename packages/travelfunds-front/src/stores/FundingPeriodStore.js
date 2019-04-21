import { observable, action } from 'mobx'
import { omit } from 'lodash'
import { getAll, update } from 'transport/funding-period'
import { update as updateBudget } from 'transport/budget'

class FundingPeriodStore {
  @observable fetching = false
  @observable fundingPeriods = []

  @action async fetch () {
    this.fetching = true
    try {
      var json = await getAll()
    } finally {
      this.fetching = false
    }
    this.fundingPeriods = json
      .sort((a, b) => a.id < b.id ? 1 : -1)
  }

  @action async update (id) {
    const fundingPeriod = this.fundingPeriods.find(x => x.id === id)
    await Promise.all([
      update(omit(fundingPeriod, ['Budgets'])),
      ...fundingPeriod.Budgets.map(updateBudget)
    ])
  }
}

const singleton = new FundingPeriodStore()
export default singleton
