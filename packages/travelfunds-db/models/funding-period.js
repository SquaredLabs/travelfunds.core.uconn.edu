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
