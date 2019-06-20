/* eslint-env jest */
const Trip = require('../models/trip')
const db = require('travelfunds-db')
const createForm = require('../../travelfunds-api/utils/create-form')

const appHook = app => {
  app.context.db = db
  return app
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

test('export works with a single valid trip in the DB', async () => {
  const body = createForm(validTrip)
  await expect(fetch('/trips', { method: 'POST', body }))
    .resolves.toHaveProperty('status', 201)
  expect(db.Trip.count()).resolves.toBe(1)

  const data = await Trip.fullExport()
  expect(data).not.toBeNull()
})
