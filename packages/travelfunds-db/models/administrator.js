module.exports = (sequelize, DataTypes) => {
  const Administrator = sequelize.define('Administrator', {
    netid: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    }
  })

  return Administrator
}
