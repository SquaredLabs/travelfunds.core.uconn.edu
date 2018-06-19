const fs = require('fs')
const path = require('path')
const mjml = require('mjml')
const Mustache = require('mustache')

const templates = fs
  .readdirSync(path.join(__dirname, '../templates'))
  .filter(file => file.endsWith('.mjml'))
  .map(file => /(.*)\.mjml/.exec(file)[1])
  .reduce((acc, name) => {
    const contents = fs.readFileSync(
      path.join(__dirname, '../templates', name + '.mjml'),
      { encoding: 'utf8' }
    )
    acc.set(name, contents)
    return acc
  }, new Map())

const render = (template, params) => {
  if (!templates.has(template)) {
    throw new Error(`Invalid template: ${template}`)
  }

  // We have to run mustache before MJML's parser in order for conditional
  // rendering to work. But we also have to run mustache after MJML's parser
  // in order for variables inside include files to populate. So we run it twice.
  const holey = templates.get(template)
  const partiallyFilled = Mustache.render(holey, params)
  const { html } = mjml(partiallyFilled, {
    minify: true,
    filePath: path.join(__dirname, '../templates', template + '.mjml')
  })
  const completelyFilled = Mustache.render(html, params)
  return completelyFilled
}

module.exports = render
