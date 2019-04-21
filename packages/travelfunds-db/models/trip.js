const { omit } = require('lodash')
const { parse } = require('date-fns')
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
    startDate: { type: DataTypes.DATEONLY, allowNull: false },
    endDate: { type: DataTypes.DATEONLY, allowNull: false },
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

    isForSenior: {
      type: new DataTypes.VIRTUAL(DataTypes.BOOLEAN, ['yearOfTerminalDegree']),
      get: function () {
        const startDateYear = parse(this.get('startDate')).getFullYear()
        const boundary = startDateYear - config.yearsUntilSenior
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

  Trip.associate = models => {
    Trip.hasMany(models.Cost)
    Trip.belongsTo(models.FundingPeriod)
  }

  Trip.prototype.getFiscalYear = async function () {
    const fundingPeriod = await this.getFundingPeriod()
    return fundingPeriod && fundingPeriod.fiscalYear
  }

  Trip.prototype.getBudgets = async function () {
    const fullTrip = await this.withAllRelations()

    // When a trip is moved to a different funding period (which has different
    // budgets, it retains the grants from the previous budgets. In these
    // situations, we want to include those grants so misallocated funds can be
    // corrected/cleared.
    //
    // On the administrative interface, you simply see extra columns from
    // different budget years.
    const budgetsFromExistingGrants = fullTrip.Costs
      .map(x => x.Grants)
      .reduce((acc, el) => [...acc, ...el], [])
      .filter(grant => grant.amount !== '0.00')
      .map(x => x.Budget)

    const budgetsFromFundingPeriod = fullTrip.FundingPeriod &&
      fullTrip.FundingPeriod.Budgets

    const budgets = [...budgetsFromExistingGrants, ...budgetsFromFundingPeriod]
    const uniqueBudgets = Object.values(budgets
      .reduce((acc, el) => ({ ...acc, [el.id]: el }), []))

    return uniqueBudgets
  }

  Trip.prototype.getFairShareLeft = async function () {
    const fiscalYear = await this.getFiscalYear()
    return Trip.getFairShareLeftWithNetIdAndFY(this.netid, fiscalYear)
  }

  Trip.prototype.withAllRelations = function () {
    return Trip.findByPkWithAllRelations(this.id)
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

  Trip.findByPkWithAllRelations = function (id) {
    return Trip.findByPk(id, {
      include: [
        {
          model: sequelize.models.Cost,
          include: {
            model: sequelize.models.Grant,
            include: {
              model: sequelize.models.Budget,
              include: { model: sequelize.models.FundingPeriod }
            }
          }
        },
        {
          model: sequelize.models.FundingPeriod,
          include: {
            model: sequelize.models.Budget,
            include: { model: sequelize.models.FundingPeriod }
          }
        }
      ]
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
      JOIN "FundingPeriods" on "FundingPeriods".id = "Budgets"."FundingPeriodId"
      WHERE
        "Trips".netid = :netid AND
        "FundingPeriods"."fiscalYear" = :fiscalYear
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
      attributes: ['id', 'name'],
      include: {
        model: sequelize.models.FundingPeriod,
        attributes: ['fiscalYear', 'name']
      }
    })
    const exportStatement = /* @sql */`
      SELECT
          "Trips".id as "ID",
          "FundingPeriods"."fiscalYear" as "Fiscal Year",
          "Trips".status as "Status",
          "Trips"."firstName" as "First Name",
          "Trips"."lastName" as "Last Name",
          "Trips".netid as "NetID",
          "Trips".title as "Title",
          "Trips".department as "Department",
          "Trips"."participationLevel" as "Participation Level",
          "Trips"."startDate" as "Travel Start Date",
          "Trips"."endDate" as "Travel End Date",
          "Trips"."createdAt" as "Submitted",
          max("Grants"."updatedAt") as "Award Date",
          "Trips"."contactEmail" as "Contact Email",
          "Trips"."yearOfTerminalDegree" as "yearOfTerminalDegree",
          sum("Costs".amount) as "Requested",
          sum("Grants".amount) as "Granted"
          ${budgets.map(() => `,
            sum(
                CASE WHEN "Grants"."BudgetId" = ?
                THEN "Grants".amount
                ELSE 0
                END
            ) as "?"`).join('')}
      FROM "Trips"
      JOIN "Costs" ON "Costs"."TripId" = "Trips".id
      JOIN "Grants" ON "Grants"."CostId" = "Costs".id
      LEFT JOIN "FundingPeriods" ON "FundingPeriods".id = "Trips"."FundingPeriodId"
      GROUP BY
        "Trips".id,
        "FundingPeriods"."fiscalYear"
      ORDER BY "Trips".id
    `

    const res = await sequelize.query(exportStatement, {
      model: Trip,
      replacements: budgets
        .map(x => [x.id, `${x.name} ${x.FundingPeriod.name}`])
        .reduce((acc, el) => [...acc, ...el], [])
    })

    return res.map(trip => ({
      ID: trip.id,
      'Standing': trip.isForSenior ? 'Senior' : 'Junior',
      ...omit(trip.dataValues, [
        'id',
        'yearOfTerminalDegree'
      ])
    }))
  }

  return Trip
}
