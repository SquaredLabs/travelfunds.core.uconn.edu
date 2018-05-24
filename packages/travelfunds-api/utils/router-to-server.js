const http = require('http')
const Koa = require('koa')

// supertest-fetch needs a http.Server instance. This is a simple
// utility meant to run in a testing environment to create an
// http.Server instance from a koa-router instance.

module.exports = (controller, appHook) =>
  http.createServer(
    appHook(new Koa())
      .use(controller.routes())
      .use(controller.allowedMethods())
      .callback())
