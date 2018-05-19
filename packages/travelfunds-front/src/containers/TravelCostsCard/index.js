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
        floatingLabelText='Primary Transport Cost'
        value={travelCosts.primaryTransport}
        onChange={ev => { travelCosts.primaryTransport = ev.target.value }}
        errorText={errors.primaryTransport}
        onBlur={() => beginValidating('primaryTransport')}
      />
      <SmartInput
        component={DollarInput}
        sidebarTextId='travelCosts.secondaryTransport'
        floatingLabelText='Secondary Transport Cost'
        value={travelCosts.secondaryTransport}
        onChange={ev => { travelCosts.secondaryTransport = ev.target.value }}
        errorText={errors.secondaryTransport}
        onBlur={() => beginValidating('secondaryTransport')}
      />
      <SmartInput
        component={DollarInput}
        sidebarTextId='travelCosts.mileage'
        floatingLabelText='Mileage Cost'
        value={travelCosts.mileage}
        onChange={ev => { travelCosts.mileage = ev.target.value }}
        errorText={errors.mileage}
        onBlur={() => beginValidating('mileage')}
      />
      <SmartInput
        component={DollarInput}
        sidebarTextId='travelCosts.registration'
        floatingLabelText='Registration Cost'
        value={travelCosts.registration}
        onChange={ev => { travelCosts.registration = ev.target.value }}
        errorText={errors.registration}
        onBlur={() => beginValidating('registration')}
      />
      <SmartInput
        component={DollarInput}
        sidebarTextId='travelCosts.mealsAndLodging'
        floatingLabelText='Meals and Lodging Cost'
        value={travelCosts.mealsAndLodging}
        onChange={ev => { travelCosts.mealsAndLodging = ev.target.value }}
        errorText={errors.mealsAndLodging}
        onBlur={() => beginValidating('mealsAndLodging')}
      />
      <BackNextButtons />
    </div>
  }
}
