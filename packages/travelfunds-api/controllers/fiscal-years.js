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

// This endpoint attempts to set up funding periods and budgets for a new fiscal
// year. It uses hard-coded defaults.
router.post('/:fiscalYear([0-9]+)/setup', async ctx => {
  const fiscalYear = Number(ctx.params.fiscalYear)
  await ctx.db.sequelize.transaction(async transaction => {
    // FundingPeriods
    const fall = await ctx.db.FundingPeriod.create({
      name: `Fall ${fiscalYear}`,
      fiscalYear,
      open: [`${fiscalYear - 1}-05-01`, `${fiscalYear}-07-01`],
      period: [`${fiscalYear - 1}-07-01`, `${fiscalYear}-01-01`]
    }, { transaction })
    const spring = await ctx.db.FundingPeriod.create({
      name: `Spring ${fiscalYear}`,
      fiscalYear,
      open: [`${fiscalYear - 1}-05-01`, `${fiscalYear}-01-01`],
      period: [`${fiscalYear}-01-01`, `${fiscalYear}-07-01`]
    }, { transaction })

    // Budgets
    const aaup = await ctx.db.Budget.create({
      name: 'AAUP',
      fiscalYear,
      seniorAllocationLimit: 0.7,
      kfsNumber: 2911020,
      usableByLawProfessors: false,
      usableForAttendanceOnly: true
    }, { transaction })
    const ovpr = await ctx.db.Budget.create({
      name: 'OVPR',
      fiscalYear,
      seniorAllocationLimit: 0.7,
      kfsNumber: 4466170,
      usableByLawProfessors: true,
      usableForAttendanceOnly: false
    }, { transaction })

    // BudgetAllocations
    await ctx.db.BudgetAllocation.bulkCreate([
      { amount: 0, BudgetId: aaup.id, FundingPeriodId: fall.id },
      { amount: 0, BudgetId: ovpr.id, FundingPeriodId: fall.id },
      { amount: 0, BudgetId: aaup.id, FundingPeriodId: spring.id },
      { amount: 0, BudgetId: ovpr.id, FundingPeriodId: spring.id }
    ], { transaction })
  })
  ctx.status = 200
})

module.exports = router
