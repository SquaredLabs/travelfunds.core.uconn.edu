module.exports = (sequelize, DataTypes) => {
  const Budget = sequelize.define('Budget', {
    name: { type: DataTypes.STRING, allowNull: false },
    fiscalYear: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    }
  })

  Budget.associate = models =>
    Budget.hasMany(models.Grant)

  return Budget
}
