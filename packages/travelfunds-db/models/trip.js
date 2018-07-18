const { omit } = require('lodash')
const config = require('../config')
const getFiscalYearForDuration = require('../utils/get-fiscal-year-for-duration')

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
    yearOfTerminalDegree: DataTypes.INTEGER,

    // Contact
    contactEmail: {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true
    },

    // Administration
    response: DataTypes.TEXT,

    fullId: {
      type: new DataTypes.VIRTUAL(DataTypes.STRING, ['id', 'fiscalYear']),
      get: function () {
        return 'FY' + this.get('fiscalYear') % 100 + '-' + this.get('id')
      }
    },
    fiscalYear: {
      type: new DataTypes.VIRTUAL(DataTypes.INTEGER, ['duration']),
      get: function () { return getFiscalYearForDuration(this.get('duration')) }
    },
    isForSenior: {
      type: new DataTypes.VIRTUAL(DataTypes.BOOLEAN, ['yearOfTerminalDegree']),
      get: function () {
        const boundary = new Date().getFullYear() - config.yearsUntilSenior
        return this.get('yearOfTerminalDegree') <= boundary
      }
    }
  }, {
    validate: {
      yearOfTerminalDegreePresent () {
        // There are records in production that do not have a
        // yearOfTerminalDegree field, so allowNull cannot be set to false. New
        // travel requests should still have this field however.
        if (this.isNewRecord && !this.yearOfTerminalDegree) {
          throw new Error('Year of Terminal Degree is required.')
        }
      }
    },
    hooks: {
      beforeValidate: trip => {
        trip.contactEmail = (trip.contactEmail && trip.contactEmail.trim()) || null
        trip.response = (trip.response && trip.response.trim()) || null
      }
    }
  })

  Trip.associate = models =>
    Trip.hasMany(models.Cost)

  Trip.prototype.getBudgets = async function () {
    const fullTrip = await this.withAllRelations()

    // This should only happen in situations where there's data corruption,
    // but a trip may have grants from a budget that's not in its fiscal year.
    // In these situations, we want to include so misallocated funds can be
    // corrected.
    //
    // Ex: When a trip is moved to a different fiscal year due to rule changes.
    const budgetsFromExistingGrants = fullTrip.Costs
      .map(x => x.Grants)
      .reduce((acc, el) => [...acc, ...el], [])
      .filter(grant => grant.amount !== '0.00')
      .map(x => x.Budget)

    const budgetsFromFiscalYear = await sequelize.models.Budget.findAll({
      where: { fiscalYear: this.fiscalYear }
    })

    const budgets = [...budgetsFromExistingGrants, ...budgetsFromFiscalYear]
    const uniqueBudgets = Object.values(budgets
      .reduce((acc, el) => ({ ...acc, [el.id]: el }), []))

    return uniqueBudgets
  }

  Trip.prototype.getFairShareLeft = async function () {
    return Trip.getFairShareLeftWithNetIdAndFY(this.netid, this.fiscalYear)
  }

  Trip.prototype.withAllRelations = function () {
    return Trip.findByIdWithAllRelations(this.id)
  }

  Trip.prototype.getGrantTotalsByBudget = async function () {
    const query = `
      SELECT
      	"Budgets".id,
        "Budgets".name,
        "Budgets"."kfsNumber",
        SUM(COALESCE("Grants".amount, 0)) as granted
      FROM "Trips"
      JOIN "Costs" ON "Costs"."TripId" = "Trips".id
      JOIN "Grants" ON "Grants"."CostId" = "Costs".id
      JOIN "Budgets" ON "Budgets".id = "Grants"."BudgetId"
      WHERE
        "Trips".id = :id
      GROUP BY
        "Trips".id,
        "Budgets".id
    `
    return sequelize.query(query, {
      replacements: { id: this.id },
      type: sequelize.QueryTypes.SELECT
    })
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

  Trip.getFairShareLeftWithNetIdAndFY = async function (netid, fiscalYear) {
    fiscalYear = fiscalYear || getFiscalYearForDuration([new Date(), new Date()])
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
        netid,
        fiscalYear
      },
      type: sequelize.QueryTypes.SELECT
    })
    return res[0].amount
  }

  Trip.fullExport = async function () {
    // We have to build a dynamic query since the number of returned columns
    // depends on how many budgets we have.
    const budgets = await sequelize.models.Budget.findAll({
      attributes: ['id', 'name', 'fiscalYear']
    })
    const exportStatement = /* @sql */`
      SELECT
          "Trips".id as "ID",
          "Trips".status as "Status",
          "Trips"."firstName" as "First Name",
          "Trips"."lastName" as "Last Name",
          "Trips".netid as "NetID",
          "Trips".title as "Title",
          "Trips".department as "Department",
          "Trips"."participationLevel" as "Participation Level",
          upper("Trips".duration) as "Travel Start Date",
          lower("Trips".duration) as "Travel End Date",
          "Trips"."createdAt" as "Submitted",
          "Trips"."updatedAt" as "Last Modified",
          "Trips".duration as "duration",
          "Trips"."yearOfTerminalDegree" as "yearOfTerminalDegree",
          sum("Costs".amount) as "Requested",
          sum("Grants".amount) as "Granted"
          ${budgets
            .map(() => `,
              sum(
                CASE WHEN "Grants"."BudgetId" = ?
                THEN "Grants".amount
                ELSE 0
                END
              ) as "?"`)
            .join('')}
      FROM "Trips"
      JOIN "Costs" ON "Costs"."TripId" = "Trips".id
      JOIN "Grants" ON "Grants"."CostId" = "Costs".id
      GROUP BY "Trips".id
      ORDER BY "Trips".id
    `

    const res = await sequelize.query(exportStatement, {
      model: Trip,
      replacements: budgets
        .map(x => [x.id, `${x.fiscalYear} ${x.name}`])
        .reduce((acc, el) => [...acc, ...el], [])
    })

    // Trip fiscal years are determined from a runtime function and purposefully
    // not included in the database. This means we'll have to populate them
    // post-query.
    return res.map(trip => ({
      ID: trip.id,
      'Fiscal Year': trip.fiscalYear,
      Status: trip.dataValues.Status,
      'Standing': trip.isForSenior ? 'Senior' : 'Junior',
      ...omit(trip.dataValues, ['id', 'duration', 'yearOfTerminalDegree'])
    }))
  }

  return Trip
}
