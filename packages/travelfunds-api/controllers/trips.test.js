/* eslint-env jest */
const trips = require('./trips')
const { makeFetch } = require('supertest-fetch')
const { omit } = require('lodash')
const db = require('travelfunds-db')
const routerToServer = require('../utils/router-to-server')
const createForm = require('../utils/create-form')
const validTrip = require('../testing/fixtures/trip-valid')

const fetch = makeFetch(routerToServer(trips))

afterAll(() => db.sequelize.close())

test('accept a valid trip request as multipart/form-data', async () => {
  const tripsBefore = await db.Trip.count()
  const body = createForm(validTrip)
  await expect(fetch('/trips', { method: 'POST', body }))
    .resolves.toHaveProperty('status', 201)

  const tripsAfter = await db.Trip.count()
  expect(tripsBefore).toBe(tripsAfter - 1)
})

test('accept a valid trip request as application/json', async () => {
  const tripsBefore = await db.Trip.count()
  await expect(fetch('/trips', {
    method: 'POST',
    body: JSON.stringify(validTrip),
    headers: { 'Content-Type': 'application/json' }
  }))
    .resolves.toHaveProperty('status', 201)

  const tripsAfter = await db.Trip.count()
  expect(tripsBefore).toBe(tripsAfter - 1)
})

test('reject a trip request that\'s missing a required field', async () => {
  expect.assertions(Object.keys(validTrip).length + 1)
  const tripsBefore = await db.Trip.count()

  const invalids = Object.keys(validTrip)
    .map(key => omit(validTrip, key))
  const responses = await Promise.all(invalids.map(trip =>
    fetch('/trips', { method: 'POST', body: createForm(trip) })
  ))
  for (const response of responses) {
    expect(response).toHaveProperty('status', 400)
  }

  const tripsAfter = await db.Trip.count()
  expect(tripsBefore).toBe(tripsAfter)
})
