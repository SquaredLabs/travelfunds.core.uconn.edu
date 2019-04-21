const common = {
  'dialect': 'postgres',
  'host': process.env.DATABASE_HOST,
  'database': process.env.DATABASE_NAME,
  'username': process.env.DATABASE_USER,
  'password': process.env.DATABASE_PASS,
  // Only log on warnings and errors
  'logging': false
}

module.exports = {
  local: {
    ...common
  },
  production: {
    ...common
  },
  development: {
    ...common
  },
  test: {
    ...common,
    'database': process.env.TEST_DATABASE_NAME
  }
}
