const path = require('path')

module.exports = {
  globalSetup: path.join(__dirname, 'testing/globalSetup.js'),
  globalTeardown: path.join(__dirname, 'testing/globalTeardown.js')
}
