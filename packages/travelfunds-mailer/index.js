require('travelfunds-env')

const mailer = require('./lib/mailer')

const auth = process.env.SMTP_USER && process.env.SMTP_PASS
  ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  : {}

const send = mailer.createSend({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth
})

module.exports = { send }
