require('travelfunds-env')
const db = require('travelfunds-db')

module.exports = async () => {
  // require.cache is reset between test files. To get test files to
  // share state, we can treat "process" as a global variable. This
  // workaround is bad for 100+ reasons, but it should have a small
  // impact outside of this file.
  process.db = db
  await db.sequelize.sync({ force: true })
}
