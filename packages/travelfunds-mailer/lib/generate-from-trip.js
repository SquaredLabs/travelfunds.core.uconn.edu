const { format } = require('date-fns')
const render = require('./render-template')

const formatDollars = amount =>
  Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    style: 'currency',
    currency: 'USD'
  })

const getSubjectFromTrip = trip => {
  // Use a nicer title :)
  const status = trip.status === 'Denied'
    ? 'Not Funded'
    : trip.status
  return `${trip.id} Travel Funds Request ${status}: ${trip.firstName} ${trip.lastName}`
}

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
    subject: getSubjectFromTrip(trip),
    createdAt: format(trip.createdAt, 'MMMM Do YYYY, h:mm a'),
    updatedAt: format(trip.updatedAt, 'MMMM Do YYYY, h:mm a'),
    duration: [trip.startDate, trip.endDate]
      .map(x => format(x, 'MMMM Do YYYY'))
      .join(' – '),
    costs: getMustachifiedCosts(trip),
    budgets: await getMustachifiedBudgets(trip)
  })

module.exports = generate
