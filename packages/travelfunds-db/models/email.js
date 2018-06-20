const config = require('../config')

module.exports = (sequelize, DataTypes) => {
  const Email = sequelize.define('Email', {
    from: DataTypes.STRING,
    to: DataTypes.STRING,
    cc: DataTypes.STRING,
    subject: DataTypes.STRING,
    html: DataTypes.TEXT,
    response: DataTypes.STRING,
    messageId: DataTypes.STRING
  })

  return Email
}
