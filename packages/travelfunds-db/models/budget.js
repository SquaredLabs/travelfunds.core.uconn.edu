const config = require('../config')

module.exports = (sequelize, DataTypes) => {
  const Budget = sequelize.define('Budget', {
    name: { type: DataTypes.STRING, allowNull: false },
    fiscalYear: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    seniorAllocationLimit: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
      defaultValue: config.defaultSeniorAllocationLimit
    },
    kfsNumber: DataTypes.INTEGER,
    usableByLawProfessors: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    usableForAttendanceOnly: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  })

  Budget.associate = models =>
    Budget.hasMany(models.Grant, { foreignKey: { allowNull: false } })

  Budget.prototype.getBalance = async function () {
    const query = /* @sql */`
      SELECT "Budgets".amount - SUM(COALESCE("Grants".amount, 0)) as balance
      FROM "Budgets"
      LEFT JOIN "Grants" on "Budgets".id = "Grants"."BudgetId"
      WHERE "Budgets".id = :budgetId
      GROUP BY "Budgets".id
    `
    const res = await sequelize.query(query, {
      replacements: { budgetId: this.id },
      type: sequelize.QueryTypes.SELECT
    })
    return res[0].balance
  }

  Budget.prototype.getSeniorFundsLeft = async function () {
    const query = /* @sql */`
      SELECT
          CAST(FLOOR("Budgets".amount * "Budgets"."seniorAllocationLimit" * 100) / 100 AS DECIMAL(10,2))
          - SUM(COALESCE("Grants".amount, 0)) AS amount
      FROM
          "Budgets"
          LEFT JOIN "Grants" ON "Budgets".id = "Grants"."BudgetId"
          LEFT JOIN "Costs" ON "Costs".id = "Grants"."CostId"
          LEFT JOIN "Trips" ON "Trips".id = "Costs"."TripId"
      WHERE
          "Budgets".id = :budgetId and
          "Trips"."yearOfTerminalDegree" <= (extract(year FROM "Trips"."startDate")::int - :yearsUntilSenior)
      GROUP BY "Budgets".id

      UNION
      -- Use union to provide a default value.
      SELECT
          CAST(FLOOR("Budgets".amount * "Budgets"."seniorAllocationLimit" * 100) / 100 AS DECIMAL(10,2))
      FROM "Budgets"
      WHERE "Budgets".id = :budgetId
    `
    const res = await sequelize.query(query, {
      replacements: {
        budgetId: this.id,

        yearsUntilSenior: config.yearsUntilSenior
      },
      type: sequelize.QueryTypes.SELECT
    })
    return res[0].amount
  }

  return Budget
}
