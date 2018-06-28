/* eslint-env jest */
const getFiscalYearForDuration = require('./get-fiscal-year-for-duration')

test('Before July cutoff', () => {
  const start = new Date(2018, 0, 2)
  const end = new Date(2018, 0, 5)
  expect(getFiscalYearForDuration([start, end])).toBe(2018)
})

test('After July cutoff', () => {
  const start = new Date(2018, 6, 1)
  const end = new Date(2018, 6, 2)
  expect(getFiscalYearForDuration([start, end])).toBe(2019)
})

test('On cutoff, closer to beginning', () => {
  const start = new Date(2018, 5, 20)
  const end = new Date(2018, 6, 2)
  expect(getFiscalYearForDuration([start, end])).toBe(2018)
})

test('On cutoff, closer to end', () => {
  const start = new Date(2018, 5, 30)
  const end = new Date(2018, 6, 3)
  expect(getFiscalYearForDuration([start, end])).toBe(2019)
})

test('On cutoff, equally staddling', () => {
  const start = new Date(2018, 5, 30)
  const end = new Date(2018, 6, 1)
  expect(getFiscalYearForDuration([start, end])).toBe(2018)
})

test('New Year\'s Day', () => {
  const start = new Date(2018, 0, 1)
  const end = new Date(2018, 0, 2)
  expect(getFiscalYearForDuration([start, end])).toBe(2018)
})

test('Before July, single day', () => {
  const start = new Date(2018, 5, 30)
  const end = new Date(2018, 5, 30)
  expect(getFiscalYearForDuration([start, end])).toBe(2018)
})

test('After July, single day', () => {
  const start = new Date(2018, 6, 1)
  const end = new Date(2018, 6, 1)
  expect(getFiscalYearForDuration([start, end])).toBe(2019)
})
