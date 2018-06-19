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
    },

    // Administration
    response: DataTypes.TEXT
  }, {
    hooks: {
      beforeValidate: trip => {
        trip.response = (this.response && trip.response.trim()) || null
      }
    }
  })

  Trip.associate = models =>
    Trip.hasMany(models.Cost)

  Object.defineProperty(Trip.prototype, 'fullId', {
    enumerable: true,
    get: function () { return 'FY' + this.fiscalYear % 100 + '-' + this.id }
  })

  Object.defineProperty(Trip.prototype, 'fiscalYear', {
    enumerable: true,
    get: function () { return config.fiscalYearForDate(this.duration[0]) }
  })

  Object.defineProperty(Trip.prototype, 'isForSenior', {
    enumerable: true,
    get: function () {
      const boundary = new Date().getFullYear() - config.yearsUntilSenior
      return this.yearOfTerminalDegree <= boundary
    }
  })

  Trip.prototype.getBudgets = function () {
    return sequelize.models.Budget.findAll({
      where: { fiscalYear: this.fiscalYear }
    })
  }

  Trip.prototype.getFairShareLeft = async function () {
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

  Trip.prototype.withAllRelations = function () {
    return Trip.findByIdWithAllRelations(this.id)
  }

  Trip.findByIdWithAllRelations = function (id) {
    return Trip.findById(id, {
      include: {
        model: sequelize.models.Cost,
        include: {
          model: sequelize.models.Grant,
          include: sequelize.models.Budget
        }
      }
    })
  }

  return Trip
}
