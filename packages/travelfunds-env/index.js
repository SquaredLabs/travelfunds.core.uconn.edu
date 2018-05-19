const path = require('path')
const dotenv = require('dotenv')
const dotenvExpand = require('dotenv-expand')

const envPaths = [
  '../../.env.local',
  '../../.env'
]

for (const envPath of envPaths) {
  const env = dotenv.config({ path: path.join(__dirname, envPath) })
  dotenvExpand(env)
}
