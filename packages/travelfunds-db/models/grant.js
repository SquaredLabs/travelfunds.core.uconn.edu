module.exports = (sequelize, DataTypes) => {
  const Grant = sequelize.define('Grant', {
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
  })

  Grant.associate = models => {
    Grant.belongsTo(models.Cost)
    Grant.belongsTo(models.Budget)
  }

  return Grant
}
