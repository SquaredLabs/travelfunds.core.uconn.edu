import React from 'react'
import { inject, observer } from 'mobx-react'

import TextField from '@material-ui/core/TextField'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import FormHelperText from '@material-ui/core/FormHelperText'

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
          component={TextField}
          type='date'
          className={styles.datePicker}
          sidebarTextId={'travelDetails.startDate'}
          value={travelDetails.startDate || ''}
          onChange={ev => {
            beginValidating('startDate')
            travelDetails.startDate = ev.target.value
          }}
          label='Beginning Date'
          error={!!errors.startDate}
          helperText={errors.startDate}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          type='date'
          className={styles.datePicker}
          value={travelDetails.endDate || ''}
          onChange={ev => {
            beginValidating('endDate')
            travelDetails.endDate = ev.target.value
          }}
          label='Ending Date'
          error={!!errors.endDate}
          helperText={errors.endDate}
          InputLabelProps={{ shrink: true }}
        />
      </div>
      <TextField
        value={travelDetails.eventTitle}
        onChange={ev => { travelDetails.eventTitle = ev.target.value }}
        label='Event Title'
        error={!!errors.eventTitle}
        helperText={errors.eventTitle}
        onBlur={() => beginValidating('eventTitle')}
      />
      <TextField
        value={travelDetails.destination}
        onChange={ev => { travelDetails.destination = ev.target.value }}
        label='Destination'
        error={!!errors.destination}
        helperText={errors.destination}
        onBlur={() => beginValidating('destination')}
      />
      <FormControl error={!!errors.participationLevel}>
        <InputLabel htmlFor='participationLevel'>Participation Level</InputLabel>
        <SmartInput
          component={Select}
          id='participationLevel'
          sidebarTextId={'travelDetails.participationLevel'}
          value={travelDetails.participationLevel}
          onChange={ev => {
            travelDetails.participationLevel = ev.target.value
            beginValidating('participationLevel')
          }}
        >
          { participationLevels.map((participationLevel, i) =>
            <MenuItem key={i} value={participationLevel}>{participationLevel}</MenuItem>
          ) }
        </SmartInput>
        <FormHelperText>{errors.participationLevel}</FormHelperText>
      </FormControl>
      <FormControl error={!!errors.primaryMethodOfTravel}>
        <InputLabel htmlFor='primaryMethodOfTravel'>Primary Method of Travel</InputLabel>
        <SmartInput
          component={Select}
          id='primaryMethodOfTravel'
          value={travelDetails.primaryMethodOfTravel}
          sidebarTextId={'travelDetails.primaryMethodOfTravel'}
          onChange={ev => {
            travelDetails.primaryMethodOfTravel = ev.target.value
            beginValidating('primaryMethodOfTravel')
          }}
        >
          { primaryMethodsOfTravel.map((method, i) =>
            <MenuItem key={i} value={method}>{method}</MenuItem>
          ) }
        </SmartInput>
        <FormHelperText>{errors.primaryMethodOfTravel}</FormHelperText>
      </FormControl>
      <BackNextButtons />
    </div>
  }
}
