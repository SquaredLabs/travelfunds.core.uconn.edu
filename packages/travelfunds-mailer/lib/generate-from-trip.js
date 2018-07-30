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

const getMustachifiedBudgets = async trip => {
  const budgets = await trip.getGrantTotalsByBudget()
  return budgets
    .filter(x => x.granted !== '0.00')
    .map(x => ({ ...x, granted: formatDollars(x.granted) }), {})
}

const generate = async trip =>
  render(trip.status.toLowerCase(), {
    ...trip.dataValues,
    fullId: trip.fullId,
    subject: getSubjectFromTrip(trip),
    createdAt: format(trip.createdAt, 'MMMM Do YYYY, h:mm a'),
    updatedAt: format(trip.updatedAt, 'MMMM Do YYYY, h:mm a'),
    duration: [new Date(trip.startDate), new Date(trip.endDate)]
      .map(x => format(x, 'MMMM Do YYYY'))
      .join(' – '),
    costs: getMustachifiedCosts(trip),
    budgets: await getMustachifiedBudgets(trip)
  })

module.exports = generate
