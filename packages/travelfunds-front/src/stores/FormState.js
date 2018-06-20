import { observable, computed, action, reaction, runInAction } from 'mobx'

import UiState from 'stores/UiState'
import { getSuggestions, getFairShareLeft } from 'transport/faculty'
import { submit } from 'transport/form'
import FacultySuggestion from 'models/FacultySuggestion'
import lang from 'lang/en_US'

class FormState {
  @observable currentFormIndex = 0

  @observable.shallow traveler = {
    netid: '',
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    title: '',
    yearOfTerminalDegree: ''
  }

  @observable.shallow contact = {
    email: ''
  }

  @observable.shallow travelDetails = {
    startDate: null,
    endDate: null,
    eventTitle: '',
    destination: '',
    participationLevel: '',
    primaryMethodOfTravel: ''
  }

  @observable.shallow travelCosts = {
    primaryTransport: '',
    secondaryTransport: '',
    mileage: '',
    registration: '',
    mealsAndLodging: ''
  }

  @observable.ref sidebarTitle = 'Hello!'
  @observable.ref sidebarContent = lang.tooltips.default

  @observable contactOption = null

  @observable backendErrors = {}

  @observable.shallow contactSuggestions = []
  @observable.shallow travelerSuggestions = []

  @action async fetchContactSuggestions () {
    if (this.contact.name === '') return
    const res = await getSuggestions(this.contact.name)
    const payload = await res.json()
    runInAction(() => {
      this.contactSuggestions = payload.splice(0, 5)
        .map(FacultySuggestion.fromPayload)
    })
  }

  @action async fetchTravelerSuggestions () {
    if (this.traveler.firstName === '') return
    const name = `${this.traveler.firstName} ${this.traveler.lastName}`.trim()
    const res = await getSuggestions(name)
    const payload = await res.json()
    runInAction(() => {
      this.travelerSuggestions = payload.splice(0, 5)
        .map(FacultySuggestion.fromPayload)
    })
  }

  /*
   * Remaining Funds
   */

  @observable fairShareLeft = null

  @action async fetchFairShareLeft () {
    if (this.traveler.netid.length !== 8) return
    const res = await getFairShareLeft(this.traveler.netid)
    const amount = await res.text()

    runInAction(() => { this.fairShareLeft = amount })
  }

  /*
   * Form Submission
   */

  async submitForm () {
    const { traveler, contact, travelDetails, travelCosts } = this
    const res = await submit({
      traveler,
      contact,
      travelDetails,
      travelCosts
    })

    if (res.status === 201) {
      UiState.redirectToFinishedPage()
      return
    }

    if (res.status >= 400 || res.status <= 500) {
      this.backendErrors = {
        all: [ 'Something unexpected happened. Please try again later.' ]
      }
      return
    }

    const json = await res.json()
    if (json.errors) {
      this.backendErrors = json.errors
    }
  }

  constructor () {
    reaction(
      () => this.contact.name,
      () => this.fetchContactSuggestions(),
      { delay: 500 }
    )

    reaction(
      () => this.traveler.netid,
      () => this.fetchFairShareLeft()
    )
  }
}

const singleton = new FormState()
export default singleton
