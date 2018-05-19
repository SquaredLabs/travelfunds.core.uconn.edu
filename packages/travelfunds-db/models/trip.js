module.exports = (sequelize, DataTypes) => {
  const Trip = sequelize.define('Trip', {
    status: {
      type: DataTypes.ENUM,
      values: ['Pending', 'Approved', 'Denied', 'Withdrawn', 'Disbursed'],
      defaultValue: 'Pending',
      allowNull: false
    },
    submitterNetId: { type: DataTypes.STRING, allowNull: false },

    // Event
    duration: { type: DataTypes.RANGE(DataTypes.DATEONLY), allowNull: false },
    eventTitle: { type: DataTypes.STRING, allowNull: false },
    destination: { type: DataTypes.STRING, allowNull: false },
    participationLevel: {
      type: DataTypes.ENUM,
      values: ['Attendance Only', 'Active Participation'],
      allowNull: false
    },
    primaryMethodOfTravel: {
      type: DataTypes.ENUM,
      values: ['Airfare', 'Bus', 'Personal Car', 'Train'],
      allowNull: false
    },

    // Traveler
    netid: { type: DataTypes.STRING, allowNull: false },
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    department: { type: DataTypes.STRING, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    yearOfTerminalDegree: { type: DataTypes.INTEGER, allowNull: false },

    // Contact
    contactEmail: {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true
    }
  })

  Trip.associate = models =>
    Trip.hasMany(models.Cost)

  return Trip
}
