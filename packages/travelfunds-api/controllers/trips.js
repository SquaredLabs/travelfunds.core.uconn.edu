const Router = require('koa-router')
const body = require('koa-body')
const { pick } = require('lodash')
const catchValidationError = require('../middleware/catch-validation-error')

const router = new Router()
router.prefix('/trips')

const multipart = body({ multipart: true })

// TODO: Guard this endpoint
router.get('/', async ctx => {
  ctx.body = await ctx.db.Trip.findAll()
})

// TODO: Guard this endpoint
router.get('/:id', async ctx => {
  const trip = await ctx.db.Trip.findById(ctx.params.id, {
    include: [{ model: ctx.db.Cost, include: [ctx.db.Grant] }]
  })
  ctx.body = {
    ...trip.dataValues,
    isForSenior: trip.isForSenior
  }
})

router.post('/', multipart, catchValidationError(), async ctx => {
  const requestFields = ctx.request.body.fields || ctx.request.body
  const assignableTripFields = [
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
      : undefined,
    submitterNetId: ctx.session.netid
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

// TODO: Guard this endpoint
router.get('/:id/budgets', async ctx => {
  const budgets = await ctx.db.Budget.findAll()
  ctx.body = await Promise.all(budgets.map(async budget =>
    ({
      ...budget.dataValues,
      balance: await budget.balance,
      seniorFundsLeft: await budget.seniorFundsLeft
    })))
})

// TODO: Guard this endpoint
router.get('/:id/fairshareleft', async ctx => {
  const trip = await ctx.db.Trip.findById(ctx.params.id)
  ctx.body = await trip.fairShareLeft
})

module.exports = router
