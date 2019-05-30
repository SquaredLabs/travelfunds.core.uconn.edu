/* eslint-env jest */
const trips = require('./trips')
const { makeFetch } = require('supertest-fetch')
const { omit } = require('lodash')
const db = require('travelfunds-db')
const routerToServer = require('../utils/router-to-server')
const createForm = require('../utils/create-form')
const validTrip = require('../testing/fixtures/trip-valid')

const appHook = app => {
  app.context.db = db
  // An authenticated user is required to talk to controllers,
  // so we'll mock a session here.
  app.context.session = { netid: 'hap11113' }
  return app
}
const fetch = makeFetch(routerToServer(trips, appHook))

const getTripFromResponse = response => {
  const location = response.headers.get('Location')
  const id = location.match(/\/([0-9]+)$/)[1]
  return db.Trip.findByPk(id)
}

beforeAll(async () => {
  await db.sequelize.sync({ force: true })
})

beforeEach(async () => {
  // sequelize requires a where clause even if the intention is to clear the
  // table. Let's throw in something that should be true for all records.
  const where = { id: { [db.Sequelize.Op.gte]: 0 } }

  await db.Trip.destroy({ where })
  await db.FundingPeriod.destroy({ where })
})

test('accept a valid trip request as multipart/form-data', async () => {
  const body = createForm(validTrip)
  await expect(fetch('/trips', { method: 'POST', body }))
    .resolves.toHaveProperty('status', 201)
  expect(db.Trip.count()).resolves.toBe(1)
})

test('accept a valid trip request as application/json', async () => {
  await expect(fetch('/trips', {
    method: 'POST',
    body: JSON.stringify(validTrip),
    headers: { 'Content-Type': 'application/json' }
  }))
    .resolves.toHaveProperty('status', 201)

  expect(db.Trip.count()).resolves.toBe(1)
})

test('reject a trip request that\'s missing a required field', async () => {
  expect.assertions(Object.keys(validTrip).length + 1)

  const invalids = Object.keys(validTrip)
    .map(key => omit(validTrip, key))
  for (const trip of invalids) {
    const response = await fetch('/trips', {
      method: 'POST',
      body: createForm(trip)
    })
    expect(response).toHaveProperty('status', 400)
  }

  expect(db.Trip.count()).resolves.toBe(0)
}, 100 * 1000)

test('ensure Trip.submitterNetId is not mass assignable', async () => {
  const trip = { ...validTrip, submitterNetId: 'mal11042' }
  const response = await fetch('/trips', {
    method: 'POST',
    body: createForm(trip)
  })
  expect(response).toHaveProperty('status', 201)

  const tripRecord = await getTripFromResponse(response)
  expect(tripRecord).not.toHaveProperty('submitterNetId', 'mal11042')
})

test('ensure Trip dates are as submitted', async () => {
  const response = await fetch('/trips', {
    method: 'POST',
    body: createForm(validTrip)
  })

  const tripRecord = await getTripFromResponse(response)
  expect(tripRecord).toHaveProperty('startDate', validTrip.startDate)
  expect(tripRecord).toHaveProperty('endDate', validTrip.endDate)
})

test('ensure Trip FundingPeriodId is correct', async () => {
  const fundingPeriod = await db.FundingPeriod.create({
    name: '2018',
    fiscalYear: 2018,
    open: [
      { value: '2017-05-01', inclusive: true },
      { value: '2018-07-01', inclusive: false }
    ],
    period: [
      { value: '2017-05-01', inclusive: true },
      { value: '2018-07-01', inclusive: false }
    ]
  })

  const response = await fetch('/trips', {
    method: 'POST',
    body: createForm(validTrip)
  })

  const tripRecord = await getTripFromResponse(response)
  expect(tripRecord).toHaveProperty('FundingPeriodId', fundingPeriod.id)
})

test('ensure Trip FundingPeriodId is NULL if there are no matching periods', async () => {
  await db.FundingPeriod.create({
    name: '2000',
    fiscalYear: 2000,
    open: [
      { value: '2000-05-01', inclusive: true },
      { value: '2001-07-01', inclusive: false }
    ],
    period: [
      { value: '2000-05-01', inclusive: true },
      { value: '2001-07-01', inclusive: false }
    ]
  })

  const response = await fetch('/trips', {
    method: 'POST',
    body: createForm(validTrip)
  })

  const tripRecord = await getTripFromResponse(response)
  expect(tripRecord).toHaveProperty('FundingPeriodId', null)
})
