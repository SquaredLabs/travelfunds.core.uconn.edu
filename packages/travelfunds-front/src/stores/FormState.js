import { observable, computed, action, reaction, runInAction } from 'mobx'

import UiState from 'stores/UiState'
import { getSuggestions, getDetails, getFairShareLeft } from 'transport/faculty'
import { submit } from 'transport/form'
import FacultySuggestion from 'models/FacultySuggestion'
import racpiIdToDepartmentMap from 'data/racpiIdToDepartmentMap.json'
import lang from 'lang/en_US'
import { ContactOptions } from 'config'

class FormState {
  @observable currentFormIndex = 0

  @observable.shallow traveler = {
    netid: '',
    firstName: '',
    lastName: '',
    email: '',
    payrollNumber: '',
    department: '',
    uboxNumber: '',
    yearOfTerminalDegree: '',
    title: ''
  }

  @observable.shallow contactMyself = {
    netid: '',
    name: '',
    phoneNumber: '',
    email: ''
  }

  @observable.shallow contactOther = {
    netid: '',
    name: '',
    phoneNumber: '',
    email: ''
  }

  @computed get contact () {
    if (this.contactOption === ContactOptions.OTHER) {
      return this.contactOther
    }

    return this.contactMyself
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

  @action async fetchAndFillContactDetails (netid) {
    const racPiToContactPropertiesMap = {
      email: 'email',
      phone: 'phoneNumber'
    }

    const res = await getDetails(netid)
    const payload = await res.json()
    runInAction(() => {
      for (const key in racPiToContactPropertiesMap) {
        if (this.contact[racPiToContactPropertiesMap[key]] === '') {
          this.contact[racPiToContactPropertiesMap[key]] = payload[key]
        }
      }
    })
  }

  @action async fetchAndFillTravelerDetails (netid) {
    const racPiToFacultyPropertiesMap = {
      email: 'email',
      payrollid: 'payrollNumber',
      mailaddress: 'uboxNumber'
    }

    const res = await getDetails(netid)
    const payload = await res.json()
    runInAction(() => {
      for (const key in racPiToFacultyPropertiesMap) {
        if (this.traveler[racPiToFacultyPropertiesMap[key]] === '') {
          this.traveler[racPiToFacultyPropertiesMap[key]] = payload[key]
        }
      }

      // Department is special. We are given back an id that we have to match.
      if (payload.deptnumber) {
        this.traveler.department = racpiIdToDepartmentMap[payload.deptnumber]
      }
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

    if (res.status === 200) {
      UiState.redirectToFinishedPage()
      return
    }

    if (res.status === 500) {
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
      () => [ this.traveler.firstName, this.traveler.lastName ],
      () => this.fetchTravelerSuggestions(),
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
