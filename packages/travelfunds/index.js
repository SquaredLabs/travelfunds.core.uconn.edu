require('travelfunds-env')

const Raven = require('raven')

if (process.env.NODE_ENV === 'production') {
  Raven.config(process.env.SENTRY_DSN).install()
}

const fs = require('fs')
const path = require('path')
const Koa = require('koa')
const Router = require('koa-router')
const session = require('koa-session')
const static = require('koa-static')
const Cas = require('koa2-cas')
const crypto = require('crypto')
const api = require('travelfunds-api')
const db = require('travelfunds-db')
const front = require('travelfunds-front')
const permissionGuard = require('./permission-guard')

const app = new Koa()

app.keys = [(process.env.APP_KEY || crypto.randomBytes(256))]
app.proxy = process.env.NODE_ENV === 'development'
app.context.db = db

const cas = new Cas({
  cas_url: 'https://login.uconn.edu/cas',
  service_url: process.env.CAS_SERVICE,
  cas_version: '2.0',
  renew: true,
  session_name: 'netid',
  is_dev_mode: process.env.NODE_ENV === 'development',
  dev_mode_user: process.env.CAS_DEV_USER,
})

const router = new Router()

router.get('/login', cas.bounce, ctx => {
  ctx.cookies.set('user', ctx.session.netid, { httpOnly: false })
  ctx.redirect('/')
})

router.get('/logout', ctx => {
  ctx.session = null
  ctx.redirect('/')
})

router.use(async (ctx, next) => {
  // The user cookie is sent to the frontend so it knows who's currently logged
  // in. If the session is invalid, then we'll want to invalidate that cookie
  // as well.
  if (!ctx.session.netid && ctx.cookies.get('user')) {
    ctx.cookies.set('user', null)
  }
  return await next()
})

router.use('/admin/(.*)?', cas.bounce)
router.use('/api/(.*)?', cas.block)

router.use(permissionGuard())
router.use(api.routes(), api.allowedMethods())
router.get('/admin/:resource?/:id?', ctx => {
  ctx.body = fs.createReadStream(path.join(front.buildPath, 'index.html'))
  ctx.type = 'text/html; charset=utf-8'
})

app.use(static(front.buildPath))
app.use(session(app))
app.use(router.routes(), router.allowedMethods())

setImmediate(async () => {
  await db.sequelize.sync()
  app.listen(process.env.LISTEN)
})
