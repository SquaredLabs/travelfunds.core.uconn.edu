const db = require('../models')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await db.sequelize.transaction(async transaction => {
      await queryInterface.addColumn('Trips', 'startDate', Sequelize.DATEONLY, {
        transaction
      })
      await queryInterface.addColumn('Trips', 'endDate', Sequelize.DATEONLY, {
        transaction
      })

      await db.sequelize.query(`
        UPDATE
          "Trips"
        SET
          "startDate" = lower("duration"),
          "endDate" = upper("duration")
      `, { transaction })

      // Deferring the NOT NULL constraint doesn't seem to be possible in
      // sequelize at the moment.
      await queryInterface.changeColumn(
        'Trips',
        'startDate',
        { type: Sequelize.DATEONLY, allowNull: false },
        { transaction }
      )
      await queryInterface.changeColumn(
        'Trips',
        'endDate',
        { type: Sequelize.DATEONLY, allowNull: false },
        { transaction }
      )

      await queryInterface.removeColumn('Trips', 'duration', { transaction })
    })
  },

  down: async (queryInterface, Sequelize) => {
    await db.sequelize.transaction(async transaction => {
      await queryInterface.addColumn(
        'Trips',
        'duration',
        Sequelize.RANGE(Sequelize.DATEONLY),
        { transaction }
      )

      await db.sequelize.query(`
        UPDATE
          "Trips"
        SET
          "duration" = DATERANGE("startDate", "endDate")
      `, { transaction })

      await queryInterface.changeColumn(
        'Trips',
        'duration',
        { type: Sequelize.RANGE(Sequelize.DATEONLY), allowNull: false },
        { transaction }
      )

      await queryInterface.removeColumn('Trips', 'startDate', { transaction }),
      await queryInterface.removeColumn('Trips', 'endDate', { transaction })
    })
  }
};
