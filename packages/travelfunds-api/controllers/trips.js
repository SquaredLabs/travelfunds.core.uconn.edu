const Router = require('koa-router')
const body = require('koa-body')
const { pick } = require('lodash')
const catchValidationError = require('../middleware/catch-validation-error')

const router = new Router()
router.prefix('/trips')

const multipart = body({ multipart: true })

router.post('/', multipart, catchValidationError(), async ctx => {
  const requestFields = ctx.request.body.fields || ctx.request.body
  const assignableFields = [
    'submitterNetId',
    'eventTitle',
    'destination',
    'participationLevel',
    'primaryMethodOfTravel',
    'netid',
    'firstName',
    'lastName',
    'email',
    'department',
    'title',
    'yearOfTerminalDegree'
  ]
  const createFields = {
    ...pick(requestFields, assignableFields),
    duration: requestFields.startDate && requestFields.endDate
      ? [ requestFields.startDate, requestFields.endDate ]
      : undefined
  }
  const trip = await ctx.db.Trip.create(createFields)
  ctx.status = 201
  ctx.set({ Location: `/api/trips/${trip.id}` })
})

module.exports = router
