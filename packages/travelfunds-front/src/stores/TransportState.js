import { observable, computed, action } from 'mobx'
const { fetch, Headers } = window

// const csrfToken = document.querySelector('meta[name="csrf-token"]').content
const csrfToken = '5'

class TransportState {
  @observable pending = []

  @action common (endpoint, options = {}) {
    this.pending.push(endpoint)

    const isRequestToOrigin = endpoint.match(/^\//)
    if (isRequestToOrigin) {
      options.headers = options.headers || new Headers()
      options.headers.set('X-CSRF-TOKEN', csrfToken)
      options.headers.set('X-Requested-With', 'XMLHttpRequest')
      options.credentials = 'same-origin'
    }

    const response = fetch(endpoint, options)
    response.then(() => {
      this.pending.pop(endpoint)
    })

    return response
  }

  @action get (endpoint, options = {}) {
    options.method = 'GET'
    return this.common(endpoint, options)
  }

  @action post (endpoint, options = {}) {
    options.method = 'POST'
    return this.common(endpoint, options)
  }

  @computed get isSendingTravelRequest () {
    return this.pending.some(el => el.match(/^\/travelrequests/))
  }
}

const singleton = new TransportState()
export default singleton

export const get = (...args) => singleton.get(...args)
export const post = (...args) => singleton.post(...args)
