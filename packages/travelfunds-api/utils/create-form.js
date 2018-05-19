const FormData = require('form-data')

module.exports = fieldValues => {
  let formData = new FormData()
  for (const key of Object.keys(fieldValues)) {
    if (fieldValues[key]) {
      formData.append(key, fieldValues[key])
    }
  }
  return formData
}
