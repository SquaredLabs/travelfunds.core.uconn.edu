const fs = require('fs')
const path = require('path')
const Sequelize = require('sequelize')

const basename = path.basename(module.filename)
const config = require(path.join(__dirname, '../database'))

const env = process.env.NODE_ENV
const sequelize = new Sequelize(config[env])

const models = fs.readdirSync(__dirname)
  .filter(file =>
    file !== basename &&
    !file.startsWith('.') &&
    file.endsWith('.js'))
  .reduce((acc, file) => {
    const model = sequelize.import(path.join(__dirname, file))
    return { ...acc, [model.name]: model }
  }, {})

for (const model of Object.values(models)) {
  if (model.associate) {
    model.associate(models)
  }
}

module.exports = {
  ...models,
  sequelize,
  Sequelize
}
