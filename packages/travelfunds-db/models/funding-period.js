module.exports = (sequelize, DataTypes) => {
  const FundingPeriod = sequelize.define('FundingPeriod', {
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
      // This column is supposed to have a Postgres EXCLUDE constraint to
      // prevent overlapping periods. Sequelize doesn't support this constraint
      // at the moment so we can't define it here. See the "add-funding-period"
      // migration for how it gets added.
    }
  })

  FundingPeriod.associate = models => {
    FundingPeriod.hasMany(models.BudgetAllocation, {
      foreignKey: {
        allowNull: false,
        onUpdate: 'cascade',
        onDelete: 'cascade'
      }
    })
    FundingPeriod.hasMany(models.Trip, {
      foreignKey: {
        allowNull: true,
        onDelete: 'set null'
      }
    })
  }

  return FundingPeriod
}
