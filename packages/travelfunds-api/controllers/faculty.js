const Router = require('koa-router')

const router = new Router()
router.prefix('/faculty')

router.get('/:netid/fair-share-left', async ctx => {
  ctx.body = await ctx.db.Trip.getFairShareLeftWithNetIdAndFY(ctx.params.netid)
})

module.exports = router
