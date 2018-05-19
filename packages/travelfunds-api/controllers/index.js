const fs = require('fs')
const path = require('path')

const basename = path.basename(module.filename)

const controllers = fs.readdirSync(__dirname)
  .filter(file =>
    file !== basename &&
    !file.startsWith('.') &&
    file.endsWith('.js') &&
    !file.endsWith('.test.js'))
  .map(file => require(path.join(__dirname, file)))

module.exports = controllers
