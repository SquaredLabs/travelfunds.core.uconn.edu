module.exports = (sequelize, DataTypes) => {
  const Cost = sequelize.define('Cost', {
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    expenseCategory: {
      type: DataTypes.ENUM,
      values: [
        'Primary Transport',
        'Secondary Transport',
        'Mileage',
        'Registration',
        'Meals & Lodging'
      ],
      allowNull: false
    }
  })

  Cost.associate = models => {
    Cost.belongsTo(models.Trip, {
      foreignKey: { allowNull: false },
      onDelete: 'CASCADE'
    })
    Cost.hasMany(models.Grant, { foreignKey: { allowNull: false } })
  }

  return Cost
}
