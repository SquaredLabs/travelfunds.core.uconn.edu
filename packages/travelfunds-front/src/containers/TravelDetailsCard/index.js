import React from 'react'
import { inject, observer } from 'mobx-react'

import TextField from 'material-ui/TextField'
import DatePicker from 'material-ui/DatePicker'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'

import SmartInput from 'containers/SmartInput'
import BackNextButtons from 'containers/BackNextButtons'
import { participationLevels, primaryMethodsOfTravel } from 'config'

import styles from './styles.scss'

@inject('FormState', 'ValidationState') @observer
export default class extends React.Component {
  render () {
    const { FormState, ValidationState } = this.props
    const { travelDetails } = FormState
    const { travelDetails: { errors, beginValidating } } = ValidationState

    return <div className={styles.container}>
      <div className={styles.travelPeriod}>
        <SmartInput
          component={DatePicker}
          className={styles.datePicker}
          sidebarTextId={'travelDetails.startDate'}
          value={travelDetails.startDate}
          onChange={(ev, date) => {
            beginValidating('startDate')
            travelDetails.startDate = date
          }}
          floatingLabelText='Beginning Date'
          errorText={errors.startDate}
          container='inline'
          firstDayOfWeek={0}
          mode='landscape'
          autoOk
          minDate={new Date()}
        />
        <DatePicker
          className={styles.datePicker}
          value={travelDetails.endDate}
          onChange={(ev, date) => {
            beginValidating('endDate')
            travelDetails.endDate = date
          }}
          floatingLabelText='Ending Date'
          errorText={errors.endDate}
          container='inline'
          firstDayOfWeek={0}
          mode='landscape'
          autoOk
          minDate={travelDetails.startDate || new Date()}
        />
      </div>
      <TextField
        value={travelDetails.eventTitle}
        onChange={ev => { travelDetails.eventTitle = ev.target.value }}
        floatingLabelText='Event Title'
        errorText={errors.eventTitle}
        onBlur={() => beginValidating('eventTitle')}
      />
      <TextField
        value={travelDetails.destination}
        onChange={ev => { travelDetails.destination = ev.target.value }}
        floatingLabelText='Destination'
        errorText={errors.destination}
        onBlur={() => beginValidating('destination')}
      />
      <SmartInput
        component={SelectField}
        sidebarTextId={'travelDetails.participationLevel'}
        value={travelDetails.participationLevel}
        onChange={(ev, index, val) => {
          travelDetails.participationLevel = val
          beginValidating('participationLevel')
        }}
        floatingLabelText='Participation Level'
        errorText={errors.participationLevel}
      >
        { participationLevels.map((participationLevel, i) =>
          <MenuItem key={i} value={participationLevel} primaryText={participationLevel} />
        ) }
      </SmartInput>
      <SmartInput
        component={SelectField}
        value={travelDetails.primaryMethodOfTravel}
        sidebarTextId={'travelDetails.primaryMethodOfTravel'}
        onChange={(ev, index, val) => {
          travelDetails.primaryMethodOfTravel = val
          beginValidating('primaryMethodOfTravel')
        }}
        floatingLabelText='Primary Method of Travel'
        errorText={errors.primaryMethodOfTravel}
      >
        { primaryMethodsOfTravel.map((method, i) =>
          <MenuItem key={i} value={method} primaryText={method} />
        ) }
      </SmartInput>
      <BackNextButtons />
    </div>
  }
}
