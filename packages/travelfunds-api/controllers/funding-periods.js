const Router = require('koa-router')
const body = require('koa-body')
const { pick } = require('lodash')

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
    include: {
      model: ctx.db.BudgetAllocation,
      include: ctx.db.Budget
    },
    order: [['period', 'asc']]
  })
})

router.get('/open', async ctx => {
  ctx.body = await ctx.db.FundingPeriod.scope('open').findAll()
})

router.get('/upcoming', async ctx => {
  ctx.body = await ctx.db.FundingPeriod.scope('upcoming').findAll()
})

router.put('/:id([0-9]+)', body(), async ctx => {
  const updates = pick(ctx.request.body, assignableFundingPeriodFields)
  await ctx.db.FundingPeriod.update(updates, {
    where: { id: ctx.params.id }
  })
  ctx.status = 200
})

module.exports = router
