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

module.exports = router
