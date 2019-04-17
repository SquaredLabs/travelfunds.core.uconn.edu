import React from 'react'
import { inject, observer } from 'mobx-react'
import currencyFormatter from 'currency-formatter'

import styles from './styles.scss'

export default
@inject('FormState') @observer
class extends React.Component {
  render () {
    const { FormState } = this.props

    if (isNaN(FormState.fairShareLeft)) {
      return null
    }

    const fairShareLeft = currencyFormatter.format(FormState.fairShareLeft, { code: 'USD' })

    return <div className={styles.container}>
      <p>Available funds for <strong>{FormState.traveler.netid}</strong>: {fairShareLeft}</p>
      <p>
        NOTE: The estimated funds available balances do not take into
        consideration qualifying titles (i.e., certain titles do not qualify for
        certain categorical funds).
      </p>
    </div>
  }
}
