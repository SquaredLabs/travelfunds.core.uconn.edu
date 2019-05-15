const Router = require('koa-router')
const body = require('koa-body')
const { pick } = require('lodash')
const json2csv = require('json2csv').parse
const mailer = require('travelfunds-mailer')

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
