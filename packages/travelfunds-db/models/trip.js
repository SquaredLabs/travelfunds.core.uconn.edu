const Op = require('sequelize').Op
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

  Trip.prototype.getFullId = async function () {
    const fiscalYear = await this.getFiscalYear()
    return 'FY' + (fiscalYear % 100) + '-' + this.get('id')
  }

  Trip.prototype.getBudgetAllocations = async function () {
    // When a trip is moved to a different funding period (which has different
    // budgets, it retains the grants from the previous budgets. In these
    // situations, we want to include those grants so misallocated funds can be
    // corrected/cleared.
    //
    // On the administrative interface, you simply see extra columns from
    // different budget years.
    const fromExistingGrantsProm = sequelize.models.BudgetAllocation
      .findAll({
        include: [
          { model: sequelize.models.Budget },
          {
            model: sequelize.models.Grant,
            attributes: [],
            required: true,
            where: { amount: { [Op.gt]: 0 } },
            include: {
              attributes: [],
              model: sequelize.models.Cost,
              required: true,
              include: {
                attributes: [],
                model: sequelize.models.Trip,
                required: true,
                where: { id: this.id }
              }
            }
          }
        ]
      })

    const fromFundingPeriodProm = sequelize.models.BudgetAllocation
      .findAll({
        include: sequelize.models.Budget,
        where: { FundingPeriodId: this.FundingPeriodId }
      })

    const [fromExistingGrants, fromFundingPeriod] = await Promise.all([
      fromExistingGrantsProm,
      fromFundingPeriodProm
    ])

    const budgetAllocations = [...fromExistingGrants, ...fromFundingPeriod]
    const uniqueBudgetAllocations = Object.values(budgetAllocations
      .reduce((acc, el) => ({ ...acc, [el.id]: el }), []))

    uniqueBudgetAllocations.sort((a, b) => a.id < b.id ? -1 : 1)

    return uniqueBudgetAllocations
  }

  Trip.prototype.getFairShareLeft = async function () {
    const fiscalYear = await this.getFiscalYear()
    return Trip.getFairShareLeftWithNetIdAndFY(this.netid, fiscalYear)
  }

  Trip.prototype.getGrantTotalsByBudget = async function () {
    const query = /* @sql */`
      SELECT
        "Budgets".id,
        "Budgets".name,
        "Budgets"."kfsNumber",
        SUM(COALESCE("Grants".amount, 0)) AS granted
      FROM
        "Trips"
        JOIN "Costs" ON "Costs"."TripId" = "Trips".id
        JOIN "Grants" ON "Grants"."CostId" = "Costs".id
        JOIN "BudgetAllocations"
          ON "BudgetAllocations".id = "Grants"."BudgetAllocationId"
        JOIN "Budgets" ON "Budgets".id = "BudgetAllocations"."BudgetId"
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

  Trip.getFairShareLeftWithNetIdAndFY = async function (netid, fiscalYear) {
    fiscalYear = fiscalYear || getFiscalYearForDuration([new Date(), new Date()])
    const query = /* @sql */`
      SELECT :fairShareAmount - SUM(COALESCE("Grants".amount, 0)) as amount
      FROM "Trips"
      JOIN "Costs" on "Costs"."TripId" = "Trips".id
      JOIN "Grants" on "Grants"."CostId" = "Costs".id
      JOIN "BudgetAllocations" on "BudgetAllocations".id = "Grants"."BudgetAllocationId"
      JOIN "Budgets" on "Budgets".id = "BudgetAllocations"."BudgetId"
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
    const budgetAllocations = await sequelize.models.BudgetAllocation.findAll({
      attributes: ['id', 'BudgetId'],
      include: [
        {
          model: sequelize.models.FundingPeriod,
          attributes: ['fiscalYear', 'name']
        },
        {
          model: sequelize.models.Budget,
          attributes: ['name']
        }
      ]
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
          "Trips"."startDate",
          "Trips"."endDate" as "Travel End Date",
          "Trips"."eventTitle" as "Event Title",
          "Trips"."destination" as "Event Location",
          "Trips"."createdAt" as "Submitted",
          max("Grants"."updatedAt") as "Award Date",
          "Trips"."contactEmail" as "Contact Email",
          "Trips"."yearOfTerminalDegree" as "yearOfTerminalDegree",
          sum("Costs".amount) as "Requested",
          sum("Grants".amount) as "Granted"
          ${budgetAllocations.map(() => `,
            sum(
                CASE WHEN "Grants"."BudgetAllocationId" = ?
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
      replacements: budgetAllocations
        .map(x => [x.id, `${x.Budget.name} ${x.FundingPeriod.name}`])
        .reduce((acc, el) => [...acc, ...el], [])
    })

    return res.map(trip => ({
      ID: trip.id,
      'Standing': trip.isForSenior ? 'Senior' : 'Junior',
      'Travel Start Date': trip.startDate,
      ...omit(trip.dataValues, [
        'id',
        'yearOfTerminalDegree'
      ])
    }))
  }

  return Trip
}
