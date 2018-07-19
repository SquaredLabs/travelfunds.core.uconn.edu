import { observable, action, computed, autorun } from 'mobx'
import { getAll } from 'transport/trip'

class TripStore {
  filterable = ['status', 'fiscalYear']

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

    for (const key of Object.keys(hydratedValues)) {
      this[key] = hydratedValues[key]
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
    return this.trips.sort((a, b) => {
      let aVal = a[this.sortProperty]
      let bVal = b[this.sortProperty]
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
            ? this.filters[property].indexOf(trip[property]) >= 0
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
        [property]: [...new Set(this.trips.map(x => x[property]))]
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
