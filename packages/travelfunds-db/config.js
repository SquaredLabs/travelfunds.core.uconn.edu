module.exports = {
  common: {
    'dialect': 'postgres',
    'host': process.env.DATABASE_HOST,
    'database': process.env.DATABASE_NAME,
    'username': process.env.DATABASE_USER,
    'password': process.env.DATABASE_PASS,
    // Only log on warnings and errors
    'logging': false,
    // https://github.com/sequelize/sequelize/issues/8417
    'operatorsAliases': false
  },
  test: {
    'database': process.env.TEST_DATABASE_NAME
  }
}
