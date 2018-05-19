const http = require('http')
const Koa = require('koa')

// We'll want to pick up the same db from globalSetup.js in a
// testing environment.
const db = process.db || require('travelfunds-db')

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
