import React from 'react'
import SmartInput from 'containers/SmartInput'
import BackNextButtons from 'containers/BackNextButtons'

import lang from 'lang/en_US'

export default class extends React.Component {
  render () {
    return <div>
      { lang.welcome.map((msg, i) => <p key={i}>{msg}</p>) }
      <SmartInput label='Contact Email' field='contact.email' />
      <BackNextButtons />
    </div>
  }
}
