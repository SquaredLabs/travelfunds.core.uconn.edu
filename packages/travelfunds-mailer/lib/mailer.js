const { promisify } = require('util')
const nodemailer = require('nodemailer')
const db = require('travelfunds-db')
const generate = require('./generate-from-trip')

const createSend = transportOptions => {
  const transport = nodemailer.createTransport(transportOptions)
  const sendMail = promisify(transport.sendMail.bind(transport))
  const shouldSendMail = transportOptions.host

  const send = async trip => {
    const html = await generate(trip)
    const titleMatches = /<title>(.*)<\/title>/.exec(html)
    if (titleMatches === null) {
      throw new Error(`Required title for email missing. Rendered HTML: ${html}`)
    }
    const title = titleMatches[1]
    const message = {
      from: process.env.SMTP_FROM,
      to: trip.email,
      cc: trip.contactEmail,
      subject: title,
      html
    }

    let [ email, res ] = await Promise.all([
      db.Email.create(message),
      ...shouldSendMail ? [sendMail(message)] : [{}]
    ])
    email.response = res.response
    email.messageId = res.messageId
    await email.save()

    return res
  }

  return send
}

module.exports = {
  createSend
}
