const Router = require('koa-router')
const body = require('koa-body')
const { pick } = require('lodash')

const router = new Router()
router.prefix('/budget-allocations')

const assignableBudgetFields = [
  'amount'
]

router.get('/', async ctx => {
  ctx.body = await ctx.db.Budget.findAll()
})

router.put('/:id([0-9]+)', body(), async ctx => {
  const updates = pick(ctx.request.body, assignableBudgetFields)
  await ctx.db.BudgetAllocation.update(updates, {
    where: { id: ctx.params.id }
  })
  ctx.status = 200
})

module.exports = router
