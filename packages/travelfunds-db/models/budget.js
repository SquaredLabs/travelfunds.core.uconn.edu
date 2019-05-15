const config = require('../config')

module.exports = (sequelize, DataTypes) => {
  const Budget = sequelize.define('Budget', {
    name: { type: DataTypes.STRING, allowNull: false },
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
    },
    fiscalYear: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  })

  Budget.associate = models => {
    Budget.hasMany(models.BudgetAllocation)
  }

  return Budget
}
