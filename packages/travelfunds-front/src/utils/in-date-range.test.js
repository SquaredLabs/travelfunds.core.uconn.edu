/* eslint-env jest */
import inDateRange from './in-date-range'

const year2019 = [
  { value: '2019-01-01', inclusive: true },
  { value: '2020-01-01', inclusive: false }
]

test('passes date within 2019', () => {
  expect(inDateRange(year2019, new Date(2019, 0, 20))).toBeTruthy()
  expect(inDateRange(year2019, new Date(2019, 0))).toBeTruthy()
})

test('fails date outside of 2019', () => {
  expect(inDateRange(year2019, new Date(2018, 0, 20))).toBeFalsy()
  expect(inDateRange(year2019, new Date(2020, 0, 20))).toBeFalsy()
  expect(inDateRange(year2019, new Date(2020, 0))).toBeFalsy()
})
