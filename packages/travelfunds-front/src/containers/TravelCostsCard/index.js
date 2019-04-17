import React from 'react'
import { inject, observer } from 'mobx-react'

import SmartInput from 'containers/SmartInput'
import BackNextButtons from 'containers/BackNextButtons'
import DollarInput from 'components/DollarInput'

import styles from './styles.scss'

export default
@inject('FormState', 'ValidationState') @observer
class extends React.Component {
  render () {
    return <div className={styles.container}>
      <SmartInput
        component={DollarInput}
        label='Primary Transport Cost'
        field='travelCosts.primaryTransport'
      />
      <SmartInput
        component={DollarInput}
        label='Secondary Transport Cost'
        field='travelCosts.secondaryTransport'
      />
      <SmartInput
        component={DollarInput}
        label='Mileage Cost'
        field='travelCosts.mileage'
      />
      <SmartInput
        component={DollarInput}
        label='Registration Cost'
        field='travelCosts.registration'
      />
      <SmartInput
        component={DollarInput}
        label='Means and Lodging Cost'
        field='travelCosts.mealsAndLodging'
      />
      <BackNextButtons />
    </div>
  }
}
