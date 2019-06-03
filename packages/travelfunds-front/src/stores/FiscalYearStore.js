import { observable, action, computed } from 'mobx'
import { getAll } from 'transport/fiscal-year'

class FiscalYearStore {
  @observable fetches = 0
  @observable fiscalYears = []

  @action async fetch () {
    this.fiscalYears = await getAll()
  }

  @computed get fetching () {
    return this.fetches.length === 0
  }
}

const singleton = new FiscalYearStore()
export default singleton
