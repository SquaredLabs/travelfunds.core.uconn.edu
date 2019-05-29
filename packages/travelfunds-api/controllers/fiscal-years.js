const Router = require('koa-router')

const router = new Router()
router.prefix('/fiscal-years')

router.get('/', async ctx => {
  const sql = /* @sql */`
    SELECT DISTINCT "fiscalYear" FROM "Budgets"
    UNION
    SELECT DISTINCT "fiscalYear" FROM "FundingPeriods"
  `
  const res = await ctx.db.sequelize.query(sql, {
    type: ctx.db.sequelize.QueryTypes.SELECT
  })
  ctx.body = res.map(x => x.fiscalYear)
    .sort()
    .reverse()
})

router.get('/:fiscalYear([0-9]+)', async ctx => {
  const { fiscalYear } = ctx.params
  const [ budgets, fundingPeriods ] = await Promise.all([
    ctx.db.Budget.findAll({ where: { fiscalYear } }),
    ctx.db.FundingPeriod.findAll({
      where: { fiscalYear },
      include: ctx.db.BudgetAllocation
    })
  ])
  ctx.body = { budgets, fundingPeriods }
})

module.exports = router
