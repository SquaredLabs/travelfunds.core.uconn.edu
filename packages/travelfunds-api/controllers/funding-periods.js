const Router = require('koa-router')
const body = require('koa-body')
const { pick } = require('lodash')
const catchValidationError = require('../middleware/catch-validation-error')
const mailer = require('travelfunds-mailer')

const router = new Router()
router.prefix('/funding-periods')

const assignableFundingPeriodFields = [
  'name',
  'fiscalYear',
  'open',
  'period'
]

router.get('/', async ctx => {
  ctx.body = await ctx.db.FundingPeriod.findAll({
    include: [ctx.db.Budget, ctx.db.BudgetAllocation],
    order: [[{ model: ctx.db.Budget }, 'id', 'asc']]
  })
})

router.get('/active', async ctx => {
  ctx.body = await ctx.db.FundingPeriod.findAll()
})

router.put('/:id([0-9]+)', body(), async ctx => {
  const updates = pick(ctx.request.body, assignableFundingPeriodFields)
  await ctx.db.FundingPeriod.update(updates, {
    where: { id: ctx.params.id }
  })
  ctx.status = 200
})

router.post('/:id([0-9]+)/trips', body({ multipart: true }), catchValidationError(), async ctx => {
  const requestFields = ctx.request.body.fields || ctx.request.body
  const assignableTripFields = [
    'startDate',
    'endDate',
    'eventTitle',
    'destination',
    'participationLevel',
    'primaryMethodOfTravel',
    'netid',
    'firstName',
    'lastName',
    'email',
    'department',
    'title',
    'yearOfTerminalDegree',
    'contactEmail'
  ]
  const createTripFields = {
    ...pick(requestFields, assignableTripFields),
    submitterNetId: ctx.session.netid,
    FundingPeriodId: ctx.params.id
  }

  const costFormTableFieldPairs = [
    ['primaryTransport', 'Primary Transport'],
    ['secondaryTransport', 'Secondary Transport'],
    ['mileage', 'Mileage'],
    ['registration', 'Registration'],
    ['mealsAndLodging', 'Meals & Lodging']
  ]

  const trip = await ctx.db.sequelize.transaction(async transaction => {
    const trip = await ctx.db.Trip.create(createTripFields, { transaction })
    const createCostFields = costFormTableFieldPairs
      .map(([formField, tableField]) => ({
        expenseCategory: tableField,
        amount: requestFields[formField],
        TripId: trip.id
      }))
    await Promise.all(createCostFields.map(fields =>
      ctx.db.Cost.create(fields, { transaction })))
    return trip
  })

  ctx.status = 201
  ctx.set({ Location: `/api/trips/${trip.id}` })

  // This is an async function, but we're not going to wait for it to finish
  // before returning an HTTP response.
  trip.then(mailer.send)
})

module.exports = router
