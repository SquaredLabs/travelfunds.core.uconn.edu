const Router = require('koa-router')

const router = new Router()
router.prefix('/emails')

router.param('email', async (id, ctx, next) => {
  const email = await ctx.db.Email.findById(id)
  if (email === null) {
    ctx.status = 404
    return
  }
  ctx.email = email
  await next()
})

router.get('/', async ctx => {
  ctx.body = await ctx.db.Email.findAll({
    attributes: { exclude: ['html'] }
  })
})

router.get('/:email/html', async ctx => {
  ctx.body = ctx.email.html
})

module.exports = router
