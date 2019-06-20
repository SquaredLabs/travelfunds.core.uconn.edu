const Router = require('koa-router')
const body = require('koa-body')
const { pick } = require('lodash')
const json2csv = require('json2csv').parse
const mailer = require('travelfunds-mailer')
const catchValidationError = require('../middleware/catch-validation-error')

const router = new Router()
router.prefix('/trips')

const multipart = body({ multipart: true })

router.param('trip', async (id, ctx, next) => {
  ctx.trip = await ctx.db.Trip.findByPk(id)
  if (!ctx.trip) {
    ctx.status = 404
    return
  }
  return next()
})

router.get('/', async ctx => {
  ctx.body = await ctx.db.Trip.findAll({
    include: ctx.db.FundingPeriod
  })
})

router.post('/', body({ multipart: true }), catchValidationError(), async ctx => {
  const Op = ctx.db.Sequelize.Op
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
  const costFormTableFieldPairs = [
    ['primaryTransport', 'Primary Transport'],
    ['secondaryTransport', 'Secondary Transport'],
    ['mileage', 'Mileage'],
    ['registration', 'Registration'],
    ['mealsAndLodging', 'Meals & Lodging']
  ]

  const trip = await ctx.db.sequelize.transaction(async transaction => {
    const fundingPeriod = await ctx.db.FundingPeriod.findOne({
      attributes: ['id'],
      where: { period: { [Op.contains]: requestFields.startDate } }
    })
    const createTripFields = {
      ...pick(requestFields, assignableTripFields),
      submitterNetId: ctx.session.netid,
      FundingPeriodId: fundingPeriod && fundingPeriod.id
    }
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
  if (process.env.NODE_ENV !== 'test') {
    mailer.send(trip)
  } else {
    // However, if we don't wait here when running tests, they will fail.
    // I'd like to remove this hack if I can find a better way
    await mailer.send(trip)
  }
})

router.get('/export', async ctx => {
  const res = await ctx.db.Trip.fullExport()
  ctx.attachment(`Travel Requests - ${new Date()}.csv`)
  ctx.type = 'text/csv'
  ctx.body = json2csv(res)
})

router.get('/:id([0-9]+)', async ctx => {
  const trip = await ctx.db.Trip.findByPk(ctx.params.id, {
    include: [
      { model: ctx.db.Cost, include: [ctx.db.Grant] },
      { model: ctx.db.FundingPeriod }
    ]
  })
  if (trip === null) return
  ctx.body = {
    ...trip.dataValues,
    isForSenior: trip.isForSenior
  }
})

router.get('/:trip([0-9]+)/budget-allocations', async ctx => {
  const budgetAllocations = await ctx.trip.getBudgetAllocations()
  ctx.body = await Promise.all(
    budgetAllocations.map(async budgetAllocation => ({
      ...budgetAllocation.dataValues,
      balance: await budgetAllocation.getBalance(),
      seniorFundsLeft: await budgetAllocation.getSeniorFundsLeft()
    })))
})

router.get('/:trip([0-9]+)/fairshareleft', async ctx => {
  ctx.body = await ctx.trip.getFairShareLeft()
})

router.put('/:id([0-9]+)/grants', multipart, async ctx => {
  const trip = await ctx.db.Trip.findByPk(ctx.params.id, {
    include: [{ model: ctx.db.Cost }]
  })

  await Promise.all(trip.Costs.map(cost =>
    ctx.db.Grant.update({ amount: 0 }, { where: { CostId: cost.id } })))

  await Promise.all(ctx.request.body
    .filter(grant => grant.amount > 0)
    .map(grant => ctx.db.Grant.upsert(pick(grant, [
      'amount',
      'BudgetAllocationId',
      'CostId'
    ]))))

  ctx.status = 201
})

router.patch('/:trip([0-9]+)', multipart, async ctx => {
  await ctx.trip.update(ctx.request.body)
  ctx.status = 204
})

router.post('/:trip([0-9]+)/send-email-update', async ctx => {
  await mailer.send(ctx.trip)
  ctx.status = 200
})

module.exports = router
