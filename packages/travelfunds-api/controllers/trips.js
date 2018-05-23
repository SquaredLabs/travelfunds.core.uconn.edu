const Router = require('koa-router')
const body = require('koa-body')
const { pick } = require('lodash')
const catchValidationError = require('../middleware/catch-validation-error')

const router = new Router()
router.prefix('/trips')

const multipart = body({ multipart: true })

router.post('/', multipart, catchValidationError(), async ctx => {
  const requestFields = ctx.request.body.fields || ctx.request.body
  const assignableTripFields = [
    'submitterNetId',
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
    'yearOfTerminalDegree'
  ]
  const createTripFields = {
    ...pick(requestFields, assignableTripFields),
    duration: requestFields.startDate && requestFields.endDate
      ? [ requestFields.startDate, requestFields.endDate ]
      : undefined
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
})

module.exports = router
