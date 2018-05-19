module.exports = async () => {
  await process.db.sequelize.close()
}
