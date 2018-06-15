module.exports = {
  fairShareAmount: 2000,
  defaultSeniorAllocationLimit: 1,
  fiscalYearForDate: date =>
    date.getMonth() < 6
      ? date.getFullYear()
      : date.getFullYear() + 1,
  // Even though the contract says 7 years, we need to go back a full
  // 8 years to make sure no one is cut off. (According to Matt Mroz.)
  yearsUntilSenior: 8
}
