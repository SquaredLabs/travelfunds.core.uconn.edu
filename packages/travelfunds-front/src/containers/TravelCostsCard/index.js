import React from 'react'
import { inject, observer } from 'mobx-react'

import SmartInput from 'containers/SmartInput'
import BackNextButtons from 'containers/BackNextButtons'
import DollarInput from 'components/DollarInput'

import styles from './styles.scss'

@inject('FormState', 'ValidationState') @observer
export default class extends React.Component {
  render () {
    const { FormState, ValidationState } = this.props
    const { travelCosts } = FormState
    const { travelCosts: { errors, beginValidating } } = ValidationState

    return <div className={styles.container}>
      <SmartInput
        component={DollarInput}
        sidebarTextId='travelCosts.primaryTransport'
        label='Primary Transport Cost'
        value={travelCosts.primaryTransport}
        onChange={ev => { travelCosts.primaryTransport = ev.target.value }}
        error={!!errors.primaryTransport}
        helperText={errors.primaryTransport}
        onBlur={() => beginValidating('primaryTransport')}
      />
      <SmartInput
        component={DollarInput}
        sidebarTextId='travelCosts.secondaryTransport'
        label='Secondary Transport Cost'
        value={travelCosts.secondaryTransport}
        onChange={ev => { travelCosts.secondaryTransport = ev.target.value }}
        error={!!errors.secondaryTransport}
        helperText={errors.secondaryTransport}
        onBlur={() => beginValidating('secondaryTransport')}
      />
      <SmartInput
        component={DollarInput}
        sidebarTextId='travelCosts.mileage'
        label='Mileage Cost'
        value={travelCosts.mileage}
        onChange={ev => { travelCosts.mileage = ev.target.value }}
        error={!!errors.mileage}
        helperText={errors.mileage}
        onBlur={() => beginValidating('mileage')}
      />
      <SmartInput
        component={DollarInput}
        sidebarTextId='travelCosts.registration'
        label='Registration Cost'
        value={travelCosts.registration}
        onChange={ev => { travelCosts.registration = ev.target.value }}
        error={!!errors.registration}
        helperText={errors.registration}
        onBlur={() => beginValidating('registration')}
      />
      <SmartInput
        component={DollarInput}
        sidebarTextId='travelCosts.mealsAndLodging'
        label='Meals and Lodging Cost'
        value={travelCosts.mealsAndLodging}
        onChange={ev => { travelCosts.mealsAndLodging = ev.target.value }}
        error={!!errors.mealsAndLodging}
        helperText={errors.mealsAndLodging}
        onBlur={() => beginValidating('mealsAndLodging')}
      />
      <BackNextButtons />
    </div>
  }
}
