module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('Emails', 'cc', Sequelize.STRING),

  down: (queryInterface, Sequelize) =>
    queryInterface.removeColumn('Emails', 'cc')
}
