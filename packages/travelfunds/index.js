require('travelfunds-env')

const fs = require('fs')
const path = require('path')
const Koa = require('koa')
const static = require('koa-static')
const api = require('travelfunds-api')
const db = require('travelfunds-db')
const front = require('travelfunds-front')

const app = new Koa()
app.use(api.routes(), api.allowedMethods())

app.context.db = db

app.use(static(front.buildPath))

const indexPath = path.join(front.buildPath, 'index.html')
app.use(ctx => {
  if (ctx.path.startsWith('/admin')) {
    ctx.body = fs.createReadStream(indexPath)
    ctx.type = 'text/html; charset=utf-8'
  }
})

setImmediate(async () => {
  await db.sequelize.sync()
  app.listen(process.env.LISTEN)
})
