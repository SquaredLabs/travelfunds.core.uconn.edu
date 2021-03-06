import { observable, action, computed, autorun } from 'mobx'
import { get } from 'lodash'
import { getAll } from 'transport/trip'

class TripStore {
  filterable = ['status', 'FundingPeriod.fiscalYear']

  @observable fetching = false
  @observable trips = []

  @observable page = 0
  @observable rowsPerPage = 25
  @observable searchText = ''
  @observable sortProperty = 'id'
  @observable sortDirection = 'desc'
  @observable filters = this.filterable
    .reduce((acc, el) => ({ ...acc, [el]: [] }), {})

  @computed get localStorage () {
    return {
      page: this.page,
      rowsPerPage: this.rowsPerPage,
      searchText: this.searchText,
      sortProperty: this.sortProperty,
      sortDirection: this.sortDirection,
      filters: this.filters
    }
  }

  @action loadObservablesFromLocalStorage () {
    if (!window.localStorage) {
      return
    }

    const item = window.localStorage.getItem('travel-requests-storage')
    const hydratedValues = JSON.parse(item) || {}

    const simpleValues = Object.keys(hydratedValues)
      .filter(x => x !== 'filters')

    for (const key of simpleValues) {
      this[key] = hydratedValues[key]
    }

    // Only hydrate allowed values for filters from local storage.
    for (const key of Object.keys(this.filters)) {
      const existing = get(hydratedValues, ['filters', key], [])
      this.filters[key] = Array.isArray(existing) ? existing : []
    }
  }

  @action async fetchTrips () {
    this.fetching = true
    try {
      this.trips = await getAll()
    } finally {
      this.fetching = false
    }
  }

  @computed get sortedTrips () {
    return this.trips.slice().sort((a, b) => {
      let aVal = get(a, this.sortProperty)
      let bVal = get(b, this.sortProperty)
      if (typeof aVal === 'string') aVal = aVal.toLowerCase()
      if (typeof bVal === 'string') bVal = bVal.toLowerCase()

      if (aVal === bVal) return 0
      if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1
    })
  }

  @computed get filteredTrips () {
    const filterByProperty = trip =>
      this.filterable
        .map(property =>
          (this.filters[property].length > 0
            ? this.filters[property].indexOf(get(trip, property)) >= 0
            : true))
        .every(x => x)

    const filterBySearchText = trip => {
      const searchText = this.searchText.trim().toLowerCase()
      const name = `${trip.firstName.toLowerCase()} ${trip.lastName.toLowerCase()}`
      return name.indexOf(searchText) >= 0 || trip.id === parseInt(searchText)
    }

    return this.sortedTrips
      .filter(filterByProperty)
      .filter(filterBySearchText)
  }

  @computed get tripsOnCurrentPage () {
    return this.filteredTrips.slice(
      this.page * this.rowsPerPage,
      (this.page + 1) * this.rowsPerPage
    )
  }

  @computed get filterOptions () {
    return this.filterable
      .reduce((acc, property) => ({
        ...acc,
        [property]: [...new Set(this.trips.map(x => get(x, property)))]
          .filter(x => x)
      }), {})
  }

  constructor () {
    this.loadObservablesFromLocalStorage()

    if (window.localStorage) {
      autorun(() => {
        window.localStorage.setItem(
          'travel-requests-storage',
          JSON.stringify(this.localStorage)
        )
      }, { delay: 200 })
    }
  }
}

const singleton = new TripStore()
export default singleton
