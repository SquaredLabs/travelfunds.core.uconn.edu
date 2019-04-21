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
    include: ctx.db.Budget,
    order: [[{ model: ctx.db.Budget }, 'id', 'asc']]
  })
})

router.put('/:id([0-9]+)', body(), async ctx => {
  const updates = pick(ctx.request.body, assignableFundingPeriodFields)
  await ctx.db.FundingPeriod.update(updates, {
    where: { id: ctx.params.id }
  })
  ctx.status = 200
})

module.exports = router
