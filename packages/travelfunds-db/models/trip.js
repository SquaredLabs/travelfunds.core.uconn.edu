const config = require('../config')

module.exports = (sequelize, DataTypes) => {
  const Trip = sequelize.define('Trip', {
    status: {
      type: DataTypes.ENUM,
      values: ['Pending', 'Approved', 'Denied', 'Withdrawn', 'Disbursed'],
      defaultValue: 'Pending',
      allowNull: false
    },
    submitterNetId: { type: DataTypes.STRING, allowNull: false },

    // Event
    duration: { type: DataTypes.RANGE(DataTypes.DATEONLY), allowNull: false },
    eventTitle: { type: DataTypes.STRING, allowNull: false },
    destination: { type: DataTypes.STRING, allowNull: false },
    participationLevel: {
      type: DataTypes.ENUM,
      values: ['Attendance Only', 'Active Participation'],
      allowNull: false
    },
    primaryMethodOfTravel: {
      type: DataTypes.ENUM,
      values: ['Airfare', 'Bus', 'Personal Car', 'Train'],
      allowNull: false
    },

    // Traveler
    netid: { type: DataTypes.STRING, allowNull: false },
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    department: { type: DataTypes.STRING, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    yearOfTerminalDegree: { type: DataTypes.INTEGER, allowNull: false },

    // Contact
    contactEmail: {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true
    }
  })

  Trip.associate = models =>
    Trip.hasMany(models.Cost)

  Object.defineProperty(Trip.prototype, 'fiscalYear', {
    enumerable: true,
    get: function () { return config.fiscalYearForDate(this.duration[0]) }
  })

  Object.defineProperty(Trip.prototype, 'fairShareLeft', {
    enumerable: true,
    get: async function () {
      const query = /* @sql */`
        SELECT :fairShareAmount - SUM(COALESCE("Grants".amount, 0)) as amount
        FROM "Trips"
        JOIN "Costs" on "Costs"."TripId" = "Trips".id
        JOIN "Grants" on "Grants"."CostId" = "Costs".id
        JOIN "Budgets" on "Budgets".id = "Grants"."BudgetId"
        WHERE
          "Trips".netid = :netid AND
          "Budgets"."fiscalYear" = :fiscalYear
        UNION SELECT :fairShareAmount
      `
      const res = await sequelize.query(query, {
        replacements: {
          fairShareAmount: config.fairShareAmount,
          netid: this.netid,
          fiscalYear: this.fiscalYear
        },
        type: sequelize.QueryTypes.SELECT
      })
      return res[0].amount
    }
  })

  Object.defineProperty(Trip.prototype, 'isForSenior', {
    enumerable: true,
    get: function () {
      const boundary = new Date().getFullYear() - config.yearsUntilSenior
      return this.yearOfTerminalDegree <= boundary
    }
  })

  return Trip
}
