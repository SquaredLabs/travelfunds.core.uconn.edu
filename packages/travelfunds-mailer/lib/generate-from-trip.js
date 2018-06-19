const { promisify } = require('util')
const nodemailer = require('nodemailer')
const { format } = require('date-fns')
const { flatten, mapValues } = require('lodash')
const db = require('travelfunds-db')
const render = require('./render-template')

const formatDollars = amount =>
  Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    style: 'currency',
    currency: 'USD'
  })

const getSubjectFromTrip = trip =>
  `${trip.fullId} Travel Funds Request ${trip.status}: ${trip.firstName} ${trip.lastName}`

const getMustachifiedCosts = trip =>
  trip.Costs.reduce((acc, el) =>
    ({
      ...acc,
      [el.expenseCategory.replace(/ /g, '')]: formatDollars(el.amount)
    }), {})

const getMustachifiedGrants = trip => {
  // TODO: This function assumes budgets have unique names. This function and
  // the MJML template should be updated to avoid this assumption.

  const grants = flatten(trip.Costs.map(cost =>
    cost.Grants.map(grant =>
      ({ ...grant.dataValues, expenseCategory: cost.expenseCategory }))))

  const mapByBudgets = grants
    .reduce((acc, el) => ({
      ...acc,
      [el.Budget.name]: [...(acc[el.Budget.name] || []), el]
    }), {})

  return mapValues(mapByBudgets, x => getMustachifiedCosts({ Costs: x }))
}

const generate = async trip =>
  render(trip.status.toLowerCase(), {
    ...trip.dataValues,
    fullId: trip.fullId,
    subject: getSubjectFromTrip(trip),
    createdAt: format(trip.createdAt, 'MMMM Do YYYY, h:mm a'),
    updatedAt: format(trip.updatedAt, 'MMMM Do YYYY, h:mm a'),
    duration: trip.duration
      .map(x => format(x, 'MMMM Mo YYYY'))
      .join(' – '),
    costs: getMustachifiedCosts(trip),
    grants: getMustachifiedGrants(trip),
    budgets: (await trip.getBudgets())
      .reduce((acc, el) => ({ ...acc, [el.name]: el }), {})
  })

module.exports = generate
