import { observable, action, computed } from 'mobx'
import { groupBy } from 'lodash'
import { getAll, update as updateFundingPeriod } from 'transport/funding-period'
import { update as updateBudgetAllocation } from 'transport/budget-allocation'

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
      .sort((a, b) => a.period[0].value < b.period[0].value ? -1 : 1)
  }

  @action async update (id) {
    const fundingPeriod = this.fundingPeriods.find(x => x.id === id)
    await Promise.all([
      updateFundingPeriod(fundingPeriod),
      ...fundingPeriod.BudgetAllocations.map(updateBudgetAllocation)
    ])
  }

  @computed get fiscalYearMap () {
    return groupBy(this.fundingPeriods, 'fiscalYear')
  }

  byYear (year) {
    return this.fiscalYearMap[year]
  }
}

const singleton = new FundingPeriodStore()
export default singleton
