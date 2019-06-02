import { observable, action, computed } from 'mobx'
import { groupBy } from 'lodash'
import { getAll, getOpen, getUpcoming, update as updateFundingPeriod } from 'transport/funding-period'
import { update as updateBudgetAllocation } from 'transport/budget-allocation'

class FundingPeriodStore {
  @observable fetches = 0
  @observable fundingPeriods = []
  @observable openFundingPeriods = []
  @observable upcomingFundingPeriods = []

  @action async fetchGeneric (transportFn) {
    this.fetches++
    try {
      var json = await transportFn()
    } finally {
      this.fetches--
    }
    return json.sort((a, b) =>
      a.period[0].value < b.period[0].value ? -1 : 1)
  }

  @action async fetch () {
    this.fundingPeriods = await this.fetchGeneric(getAll)
  }

  @action async fetchOpen () {
    this.openFundingPeriods = await this.fetchGeneric(getOpen)
  }

  @action async fetchUpcoming () {
    this.upcomingFundingPeriods = await this.fetchGeneric(getUpcoming)
  }

  @computed get fetching () {
    return this.fetches.length === 0
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
