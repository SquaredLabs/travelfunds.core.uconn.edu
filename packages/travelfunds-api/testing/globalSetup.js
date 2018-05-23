require('travelfunds-env')
const db = require('travelfunds-db')

module.exports = async () => {
  await db.sequelize.sync({ force: true })
  await db.sequelize.close()
}
