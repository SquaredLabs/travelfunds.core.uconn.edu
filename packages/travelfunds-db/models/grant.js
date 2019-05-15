module.exports = (sequelize, DataTypes) => {
  const Grant = sequelize.define('Grant', {
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
  })

  Grant.associate = models => {
    Grant.belongsTo(models.Cost, {
      foreignKey: { allowNull: false, unique: 'trip' },
      onDelete: 'CASCADE'
    })
    Grant.belongsTo(models.BudgetAllocation, {
      foreignKey: { allowNull: false, unique: 'trip' },
      onDelete: 'CASCADE'
    })
  }

  return Grant
}
