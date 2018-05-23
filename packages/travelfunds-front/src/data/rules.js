import Validator from 'validatorjs'
import FormState from 'stores/FormState'
import * as Cookies from 'js-cookie'
import { observable, computed } from 'mobx'

import { titles, participationLevels, primaryMethodsOfTravel, ContactOptions } from 'config'

// https://stackoverflow.com/questions/4149276/javascript-camelcase-to-regular-form
Validator.setAttributeFormatter(attribute => (
  attribute.replace(/([A-Z])/g, ' $1').toLowerCase()
))

Validator.register(
  'before_current_date',
  value => value <= (new Date()).getFullYear(),
  ':attribute must be before the current year'
)

Validator.register(
  'traveler_must_be_me_if_i_am_filling_for_myself',
  value => FormState.contactOption !== ContactOptions.MYSELF || value === Cookies.get('login'),
  'You indicated earlier that you would be submitting for yourself. If this is not true, go back and enter yourself as a contact.'
)

Validator.register(
  'i_must_be_traveler_or_contact',
  value => (new Set([FormState.contact.netid, FormState.traveler.netid])).has(Cookies.get('user')),
  'You must be either the contact or the traveling faculty.'
)

Validator.register(
  'traveler_must_be_a_junior_faculty_if_senior_funds_are_used',
  value => (!window.closedForSeniors || value >= (new Date()).getFullYear() - 8),
  'Your year of terminal degree indicates that you are a senior faculty member. All funds for senior faculty have been allocated for the current fiscal year. If you believe this is a mistake, please email phyllis.horvith@uconn.edu'
)

export const rules = observable({
  traveler: {
    netid: [
      'required',
      'max:8',
      'regex:/^[a-z]{3}[0-9]{5}$/',
      'traveler_must_be_me_if_i_am_filling_for_myself',
      'i_must_be_traveler_or_contact'
    ],
    firstName: 'required|string',
    lastName: 'required|string',
    email: 'required|email',
    payrollNumber: 'required|numeric|min:0|max:999999',
    department: 'required|string',
    uboxNumber: 'required|string',
    yearOfTerminalDegree: 'required|integer|min:1900|before_current_date|traveler_must_be_a_junior_faculty_if_senior_funds_are_used',
    title: [ 'required', 'string', { 'in': titles } ]
  },

  contact: computed(() => {
    if (FormState.contactOption === ContactOptions.MYSELF) {
      // Required with does not seem to work with mulitple properties. Likely
      // a validatorjs bug since the documentation has an example with this.
      // We'll create a cyclical requirement instead.
      return {
        name: 'string|required_with:email',
        netid: 'regex:/^[a-z]{3}[0-9]{5}$/|required_with:name',
        email: 'email|required_with:netid',
        phoneNumber: 'string'
      }
    }

    return {
      name: 'required|string',
      netid: [ 'required', 'regex:/^[a-z]{3}[0-9]{5}$/' ],
      email: 'required|email',
      phoneNumber: 'string'
    }
  }),

  travelDetails: {
    startDate: 'required|date',
    endDate: 'required|date|after_or_equal:startDate',
    eventTitle: 'required|string',
    destination: 'required|string',
    participationLevel: [ 'required', 'string', { 'in': participationLevels } ],
    primaryMethodOfTravel: [ 'required', 'string', { 'in': primaryMethodsOfTravel } ]
  },

  travelCosts: {
    primaryTransport: 'min:0|max:999999|numeric|required_without_all:secondaryTransport,mileage,registration,mealsAndLodging',
    secondaryTransport: 'min:0|max:999999|numeric|required_without_all:primaryTransport,mileage,registration,mealsAndLodging',
    mileage: 'min:0|max:999999|numeric|required_without_all:primaryTransport,secondaryTransport,registration,mealsAndLodging',
    registration: 'min:0|max:999999|numeric|required_without_all:primaryTransport,secondaryTransport,mileage,mealsAndLodging',
    mealsAndLodging: 'min:0|max:999999|numeric|required_without_all:primaryTransport,secondaryTransport,mileage,registration'
  }
})

export const messages = {
  travelCosts: ['primaryTransport', 'secondaryTransport', 'mileage', 'registration', 'mealsAndLodging']
    .reduce((acc, key) => (
      { ...acc, [`required_without_all.${key}`]: 'At least one cost is required.' }
    ), {})
}
