import Validator from 'validatorjs'
import { titles, participationLevels, primaryMethodsOfTravel } from 'config'

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
  'traveler_must_be_a_junior_faculty_if_senior_funds_are_used',
  value => (!window.closedForSeniors || value >= (new Date()).getFullYear() - 8),
  'Your year of terminal degree indicates that you are a senior faculty member. All funds for senior faculty have been allocated for the current fiscal year. If you believe this is a mistake, please email phyllis.horvith@uconn.edu'
)

export const rules = {
  traveler: {
    netid: [
      'required',
      'max:8',
      'regex:/^[a-z]{3}[0-9]{5}$/'
    ],
    firstName: 'required|string',
    lastName: 'required|string',
    email: 'required|email',
    department: 'required|string',
    title: [ 'required', 'string', { 'in': titles } ],
    yearOfTerminalDegree: 'required|integer|min:1900|before_current_date|traveler_must_be_a_junior_faculty_if_senior_funds_are_used'
  },

  contact: {
    email: 'email'
  },

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
}

export const messages = {
  travelCosts: ['primaryTransport', 'secondaryTransport', 'mileage', 'registration', 'mealsAndLodging']
    .reduce((acc, key) => (
      { ...acc, [`required_without_all.${key}`]: 'At least one cost is required.' }
    ), {})
}
