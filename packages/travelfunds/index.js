require('travelfunds-env')

const Koa = require('koa')
const static = require('koa-static')
const api = require('travelfunds-api')
const db = require('travelfunds-db')
const front = require('travelfunds-front')

const app = new Koa()
app.use(api.routes(), api.allowedMethods())

app.context.db = db

app.use(static(front.buildPath))

setImmediate(async () => {
  await db.sequelize.sync()
  app.listen(process.env.LISTEN)
})
