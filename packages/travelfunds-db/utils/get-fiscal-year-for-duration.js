const { getOverlappingDaysInRanges } = require('date-fns')

module.exports = duration => {
  const firstFY = duration[0].getFullYear()
  const secondFY = firstFY + 1
  const firstFYRange = [new Date(firstFY - 1, 6, 1), new Date(firstFY, 5, 30)]
  const secondFYRange = [new Date(secondFY - 1, 6, 1), new Date(secondFY, 5, 30)]
  const daysInFirstFY = getOverlappingDaysInRanges(...duration, ...firstFYRange)
  const daysInSecondFY = getOverlappingDaysInRanges(...duration, ...secondFYRange)

  if (daysInFirstFY === daysInSecondFY) {
    return duration[0].getMonth() < 6
      ? firstFY
      : secondFY
  } else if (daysInFirstFY > daysInSecondFY) {
    return firstFY
  } else if (daysInFirstFY < daysInSecondFY) {
    return secondFY
  }
}
