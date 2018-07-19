import { observable, action, computed, autorun } from 'mobx'
import { getAll, getHTML } from 'transport/email'

class EmailLogStore {
  @observable fetching = false
  @observable emails = []

  @observable page = 0
  @observable rowsPerPage = 25
  @observable searchText = ''

  @computed get localStorage () {
    return {
      page: this.page,
      rowsPerPage: this.rowsPerPage,
      searchText: this.searchText
    }
  }

  @action loadObservablesFromLocalStorage () {
    if (!window.localStorage) {
      return
    }

    const item = window.localStorage.getItem('email-log-storage')
    const hydratedValues = JSON.parse(item) || {}

    for (const key of Object.keys(hydratedValues)) {
      this[key] = hydratedValues[key]
    }
  }

  @action async fetchEmails () {
    this.fetching = true
    try {
      var json = await getAll()
    } finally {
      this.fetching = false
    }
    this.emails = json
      .map(x => ({ ...x, html: null }))
      .sort((a, b) => a.id < b.id ? 1 : -1)
  }

  @action async fetchEmail (id) {
    const email = this.emails.find(x => x.id === id)
    if (email.html) return
    email.html = await getHTML(id)
  }

  @computed get filtered () {
    const searchText = this.searchText.trim()
    return this.emails
      .filter(x =>
        x.subject.toLowerCase().indexOf(searchText.toLowerCase()) !== -1)
  }

  @computed get currentPage () {
    return this.filtered.slice(
      this.page * this.rowsPerPage,
      (this.page + 1) * this.rowsPerPage
    )
  }

  constructor () {
    this.loadObservablesFromLocalStorage()

    if (window.localStorage) {
      autorun(() => {
        window.localStorage.setItem(
          'email-log-storage',
          JSON.stringify(this.localStorage)
        )
      }, { delay: 200 })
    }
  }
}

const singleton = new EmailLogStore()
export default singleton
