const db = require('../models')
const { parse } = require('date-fns')
const { keyBy, mapValues } = require('lodash')
const getFiscalYearForDuration = require('../utils/get-fiscal-year-for-duration')

exports.up = async (queryInterface, Sequelize) => {
  const DataTypes = Sequelize

  await db.sequelize.transaction(async transaction => {
    await queryInterface.createTable('FundingPeriods', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      fiscalYear: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      open: {
        type: DataTypes.RANGE(DataTypes.DATEONLY),
        allowNull: false,
        comment: 'The date range submissions will be accepted.'
      },
      period: {
        type: DataTypes.RANGE(DataTypes.DATEONLY),
        allowNull: false,
        comment: 'The date range travel requests fall into.'
      },
      createdAt: {
        type: DataTypes.DATE
      },
      updatedAt: {
        type: DataTypes.DATE
      }
    }, {
      transaction
    })

    const res = await queryInterface.bulkInsert('FundingPeriods', [
      {
        name: '2018',
        fiscalYear: 2018,
        open: '[2017-05-01, 2018-07-01)',
        period: '[2017-07-01, 2018-07-01)',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '2019',
        fiscalYear: 2019,
        open: '[2018-05-01, 2019-07-01)',
        period: '[2018-07-01, 2019-07-01)',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {
      returning: true,
      transaction
    })

    const mapYearToId = mapValues(keyBy(res, 'fiscalYear'), x => x.id)

    const updateBudgets = async function () {
      await queryInterface.addColumn('Budgets', 'FundingPeriodId',
        { type: DataTypes.INTEGER },
        { transaction })

      await queryInterface.bulkUpdate('Budgets',
        { FundingPeriodId: mapYearToId[2018] },
        { fiscalYear: 2018 },
        { transaction })

      await queryInterface.bulkUpdate('Budgets',
        { FundingPeriodId: mapYearToId[2019] },
        { fiscalYear: 2019 },
        { transaction })

      await queryInterface.changeColumn('Budgets', 'FundingPeriodId',
        {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'FundingPeriods',
            key: 'id'
          },
          onUpdate: 'cascade',
          onDelete: 'cascade'
        },
        { transaction })

      await queryInterface.removeColumn('Budgets', 'fiscalYear', { transaction })
    }

    const updateTrips = async function () {
      await queryInterface.addColumn('Trips', 'FundingPeriodId',
        { type: DataTypes.INTEGER },
        { transaction })

      const trips = await db.sequelize.query(`
        SELECT
          "id",
          "startDate",
          "endDate"
        FROM "Trips"
      `, { type: db.sequelize.QueryTypes.SELECT, transaction })

      const yearIs = year => trip => {
        const tripYear = getFiscalYearForDuration([
          parse(trip.startDate),
          parse(trip.endDate)
        ])
        return tripYear === year
      }

      await queryInterface.bulkUpdate('Trips',
        { FundingPeriodId: mapYearToId[2018] },
        { id: trips.filter(yearIs(2018)).map(x => Number(x.id)) },
        { transaction })

      await queryInterface.bulkUpdate('Trips',
        { FundingPeriodId: mapYearToId[2019] },
        { id: trips.filter(yearIs(2019)).map(x => Number(x.id)) },
        { transaction })

      await queryInterface.changeColumn('Trips', 'FundingPeriodId',
        {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'FundingPeriods',
            key: 'id'
          },
          onDelete: 'set null'
        },
        { transaction })
    }

    await Promise.all([
      updateBudgets(),
      updateTrips()
    ])
  })
}

exports.down = async (queryInterface, Sequelize) => {
  const DataTypes = Sequelize

  await db.sequelize.transaction(async transaction => {
    await queryInterface.addColumn('Budgets', 'fiscalYear',
      { type: DataTypes.INTEGER },
      { transaction })

    const fundingPeriods = await db.sequelize.query(
      `SELECT id, "fiscalYear" FROM "FundingPeriods"`,
      { type: db.sequelize.QueryTypes.SELECT, transaction }
    )

    const mapFiscalYearToFundingPeriodId = mapValues(
      keyBy(fundingPeriods, 'fiscalYear'),
      fundingPeriod => fundingPeriod.id)

    await queryInterface.bulkUpdate('Budgets',
      { fiscalYear: 2018 },
      { FundingPeriodId: mapFiscalYearToFundingPeriodId[2018] },
      { transaction })

    await queryInterface.bulkUpdate('Budgets',
      { fiscalYear: 2019 },
      { FundingPeriodId: mapFiscalYearToFundingPeriodId[2019] },
      { transaction })

    await queryInterface.removeColumn('Budgets', 'FundingPeriodId', { transaction })
    await queryInterface.removeColumn('Trips', 'FundingPeriodId', { transaction })

    await queryInterface.dropTable('FundingPeriods', { transaction })

    await queryInterface.changeColumn('Budgets', 'fiscalYear',
      { type: DataTypes.INTEGER, allowNull: false },
      { transaction })
  })
}
