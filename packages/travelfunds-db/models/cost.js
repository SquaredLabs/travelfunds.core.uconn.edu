module.exports = (sequelize, DataTypes) => {
  const Cost = sequelize.define('Cost', {
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    expenseCategory: {
      type: DataTypes.ENUM,
      values: [
        'Primary',
        'Secondary',
        'Mileage',
        'Registration',
        'Meals & Lodging'
      ],
      allowNull: false
    }
  })

  Cost.associate = models => {
    Cost.belongsTo(models.Trip)
    Cost.hasMany(models.Grant)
  }

  return Cost
}
