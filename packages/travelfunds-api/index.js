const Router = require('koa-router')
const controllers = require('./controllers')

const router = new Router()
router.prefix('/api')

for (const controller of controllers) {
  router.use(controller.routes(), controller.allowedMethods())
}

module.exports = router
