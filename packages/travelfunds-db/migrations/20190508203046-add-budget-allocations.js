const db = require('../models')

exports.up = (queryInterface, Sequelize) =>
  db.sequelize.transaction(async transaction => {
    const DataTypes = Sequelize

    await createBudgetAllocationsTable()
    await moveAmountsToAllocations()
    await associateGrantsToBudgetAllocations()
    await associateBudgetsDirectlyToFiscalYear()

    async function createBudgetAllocationsTable () {
      await queryInterface.createTable('BudgetAllocations', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        amount: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 0
        },
        BudgetId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'Budgets',
            key: 'id'
          },
          onUpdate: 'cascade',
          onDelete: 'cascade'
        },
        FundingPeriodId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'FundingPeriods',
            key: 'id'
          },
          onUpdate: 'cascade',
          onDelete: 'cascade'
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false
        }
      }, {
        transaction
      })

      await queryInterface.addConstraint(
        'BudgetAllocations',
        ['BudgetId', 'FundingPeriodId'],
        { type: 'unique', transaction }
      )
    }

    async function moveAmountsToAllocations () {
      await db.sequelize.query(`
        INSERT INTO "BudgetAllocations"
          ("BudgetId", "amount", "FundingPeriodId", "createdAt", "updatedAt")
        SELECT
          "id", "amount", "FundingPeriodId", NOW(), NOW()
        FROM
          "Budgets";
      `, { transaction })
      await queryInterface.removeColumn('Budgets', 'amount', { transaction })
    }

    async function associateGrantsToBudgetAllocations () {
      await queryInterface.addColumn('Grants', 'BudgetAllocationId',
        { type: DataTypes.INTEGER },
        { transaction })
      await db.sequelize.query(`
        UPDATE
          "Grants"
        SET
          "BudgetAllocationId" = allocations.id
        FROM
          (
            SELECT
              "id",
              "BudgetId"
            FROM
              "BudgetAllocations"
          ) AS allocations
        WHERE
          "Grants"."BudgetId" = allocations."BudgetId";
      `, { transaction })
      await queryInterface.changeColumn('Grants', 'BudgetAllocationId',
        {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'BudgetAllocations',
            key: 'id'
          },
          onUpdate: 'cascade',
          onDelete: 'cascade'
        },
        { transaction })
      await queryInterface.removeColumn('Grants', 'BudgetId', { transaction })
      await queryInterface.addConstraint(
        'Grants',
        ['CostId', 'BudgetAllocationId'],
        { type: 'unique', transaction }
      )
    }

    async function associateBudgetsDirectlyToFiscalYear () {
      await queryInterface.addColumn('Budgets', 'fiscalYear',
        { type: DataTypes.INTEGER },
        { transaction })
      await db.sequelize.query(`
        UPDATE
          "Budgets"
        SET
          "fiscalYear" = periods."fiscalYear"
        FROM
          (
            SELECT "id", "fiscalYear"
            FROM "FundingPeriods"
          ) AS periods
        WHERE "Budgets"."FundingPeriodId" = periods.id;
      `, { transaction })
      await queryInterface.changeColumn('Budgets', 'fiscalYear',
        { type: DataTypes.INTEGER, allowNull: false },
        { transaction })
      await queryInterface.removeColumn(
        'Budgets',
        'FundingPeriodId',
        { transaction })
    }
  })

exports.down = (queryInterface, Sequelize) =>
  db.sequelize.transaction(async transaction => {
    const DataTypes = Sequelize

    await moveAmountsBackToBudgets()
    await associateGrantsBackToBudgets()
    await associateBudgetsBackToFundingPeriods()
    await dropBudgetAllocations()

    async function moveAmountsBackToBudgets () {
      await queryInterface.addColumn(
        'Budgets',
        'amount',
        {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 0
        },
        { transaction })
      await db.sequelize.query(`
        UPDATE
          "Budgets"
        SET
          amount = allocations.amount
        FROM
          (
            SELECT
            "amount",
            "BudgetId"
            FROM "BudgetAllocations"
          ) AS allocations
        WHERE "Budgets".id = allocations."BudgetId";
      `, { transaction })
    }

    async function associateGrantsBackToBudgets () {
      await queryInterface.addColumn('Grants', 'BudgetId',
        { type: DataTypes.INTEGER },
        { transaction })
      await db.sequelize.query(`
        UPDATE
          "Grants"
        SET
          "BudgetId" = allocations."BudgetId"
        FROM (
          SELECT
            "id",
            "BudgetId"
          FROM
            "BudgetAllocations") AS allocations
        WHERE
          "Grants"."BudgetAllocationId" = allocations.id;
      `, { transaction })
      await queryInterface.changeColumn('Grants', 'BudgetId',
        {
          type: DataTypes.INTEGER,
          references: {
            model: 'Budgets',
            key: 'id'
          },
          onUpdate: 'cascade',
          onDelete: 'cascade'
        },
        { transaction })
      await queryInterface.removeColumn(
        'Grants',
        'BudgetAllocationId',
        { transaction })
      await queryInterface.addConstraint(
        'Grants',
        ['CostId', 'BudgetId'],
        { type: 'unique', transaction }
      )
    }

    async function associateBudgetsBackToFundingPeriods () {
      await queryInterface.addColumn('Budgets', 'FundingPeriodId',
        { type: DataTypes.INTEGER },
        { transaction })
      await db.sequelize.query(`
        UPDATE
          "Budgets"
        SET
          "FundingPeriodId" = periods.id
        FROM
          (
            SELECT
            "id",
            "fiscalYear"
            FROM "FundingPeriods"
          ) AS periods
        WHERE "Budgets"."fiscalYear" = periods."fiscalYear";
      `, { transaction })
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

    async function dropBudgetAllocations () {
      await queryInterface.dropTable('BudgetAllocations', { transaction })
    }
  })
