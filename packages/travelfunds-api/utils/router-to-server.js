const http = require('http')
const Koa = require('koa')

const db = require('travelfunds-db')

// supertest-fetch needs a http.Server instance. This is a simple
// utility meant to run in a testing environment to create an
// http.Server instance from a koa-router instance.

module.exports = controller => {
  const app = new Koa()
  app
    .use(controller.routes())
    .use(controller.allowedMethods())
  app.context.db = db
  return http.createServer(app.callback())
}
