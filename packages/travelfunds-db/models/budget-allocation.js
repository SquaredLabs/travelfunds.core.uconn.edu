const config = require('../config')

module.exports = (sequelize, DataTypes) => {
  const BudgetAllocation = sequelize.define('BudgetAllocation', {
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    }
  })

  BudgetAllocation.associate = models => {
    BudgetAllocation.hasMany(models.Grant, {
      foreignKey: {
        allowNull: false,
        onDelete: 'cascade',
        onUpdate: 'cascade'
      }
    })
    BudgetAllocation.belongsTo(models.Budget, {
      foreignKey: {
        allowNull: false,
        unique: 'budget_funding_period',
        onDelete: 'cascade',
        onUpdate: 'cascade'
      }
    })
    BudgetAllocation.belongsTo(models.FundingPeriod, {
      foreignKey: {
        allowNull: false,
        unique: 'budget_funding_period',
        onDelete: 'cascade',
        onUpdate: 'cascade'
      }
    })
  }

  BudgetAllocation.prototype.getBalance = async function () {
    const query = /* @sql */`
      SELECT "BudgetAllocations".amount - SUM(COALESCE("Grants".amount, 0)) as balance
      FROM "BudgetAllocations"
      LEFT JOIN "Grants" on "BudgetAllocations".id = "Grants"."BudgetAllocationId"
      WHERE "BudgetAllocations".id = :budgetAllocationId
      GROUP BY "BudgetAllocations".id
    `
    const res = await sequelize.query(query, {
      replacements: { budgetAllocationId: this.id },
      type: sequelize.QueryTypes.SELECT
    })
    return res[0].balance
  }

  BudgetAllocation.prototype.getSeniorFundsLeft = async function () {
    const getSeniorAllocationAmountSubquery = /* @sql */`
      SELECT
        CAST(
          FLOOR(
            COALESCE(SUM("BudgetAllocations".amount)) *
            "Budgets"."seniorAllocationLimit" *
            100
          )
          / 100
          AS DECIMAL(10,2)
        )
      FROM
        "Budgets"
        JOIN "BudgetAllocations"
          ON "BudgetAllocations"."BudgetId" = "Budgets".id
      WHERE
        "Budgets".id = (
          SELECT "BudgetId"
          FROM "BudgetAllocations"
          WHERE id = :budgetAllocationId
        )
      GROUP BY
        "Budgets".id
    `
    const getSeniorGrantsTotal = /* @sql */`
      SELECT
        COALESCE(SUM("Grants".amount), 0)
      FROM
        "Grants"
        JOIN "BudgetAllocations"
          ON "BudgetAllocations".id = "Grants"."BudgetAllocationId"
        JOIN "Costs" ON "Costs".id = "Grants"."CostId"
        JOIN "Trips" ON "Trips".id = "Costs"."TripId"
      WHERE
        "BudgetAllocations".id = :budgetAllocationId and
        "Trips"."yearOfTerminalDegree" <=
          (extract(year FROM "Trips"."startDate")::int - :yearsUntilSenior)
    `
    const query = /* @sql */`
      SELECT
        (${getSeniorAllocationAmountSubquery}) - (${getSeniorGrantsTotal}) AS amount
    `
    const res = await sequelize.query(query, {
      replacements: {
        budgetAllocationId: this.id,
        yearsUntilSenior: config.yearsUntilSenior
      },
      type: sequelize.QueryTypes.SELECT
    })
    return res[0].amount
  }

  return BudgetAllocation
}
