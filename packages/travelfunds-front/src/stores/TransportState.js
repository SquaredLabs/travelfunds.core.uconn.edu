import { observable, computed, action } from 'mobx'
import * as Cookies from 'js-cookie'
import fetch from 'isomorphic-fetch'

class TransportState {
  @observable pending = []

  @action async common (endpoint, options = {}) {
    this.pending.push(endpoint)

    const isRequestToOrigin = endpoint.match(/^\//)
    if (isRequestToOrigin) {
      options.headers = {
        ...options.headers,
        'X-CSRF-TOKEN': Cookies.get('csrf-token'),
        'X-Requested-With': 'XMLHttpRequest'
      }
      options.credentials = 'same-origin'
    }

    const response = await fetch(endpoint, options)
    this.pending.pop(endpoint)

    if (response.status < 200 || response.status >= 300) {
      throw new Error(await response.text())
    }

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

  @action patch (endpoint, options = {}) {
    options.method = 'PATCH'
    return this.common(endpoint, options)
  }

  @action put (endpoint, options = {}) {
    options.method = 'PUT'
    return this.common(endpoint, options)
  }

  @computed get isSendingTravelRequest () {
    return this.pending.some(el => el.match(/^\/api\/trips/))
  }
}

const singleton = new TransportState()
export default singleton

export const get = (...args) => singleton.get(...args)
export const post = (...args) => singleton.post(...args)
export const patch = (...args) => singleton.patch(...args)
export const put = (...args) => singleton.put(...args)
