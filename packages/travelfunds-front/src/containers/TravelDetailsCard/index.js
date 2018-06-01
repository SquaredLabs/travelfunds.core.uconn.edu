import React from 'react'
import { inject, observer } from 'mobx-react'

import Select from 'components/FormControlSelect'
import MenuItem from '@material-ui/core/MenuItem'

import SmartInput from 'containers/SmartInput'
import BackNextButtons from 'containers/BackNextButtons'
import { participationLevels, primaryMethodsOfTravel } from 'config'

import styles from './styles.scss'

@inject('FormState', 'ValidationState') @observer
export default class extends React.Component {
  render () {
    return <div className={styles.container}>
      <SmartInput
        label='Beginning Date'
        field='travelDetails.startDate'
        type='date'
        InputLabelProps={{ shrink: true }}
      />
      <SmartInput
        label='End Date'
        field='travelDetails.endDate'
        type='date'
        InputLabelProps={{ shrink: true }}
      />
      <SmartInput label='Event Title' field='travelDetails.eventTitle' />
      <SmartInput label='Destination' field='travelDetails.destination' />
      <SmartInput
        component={Select}
        label='Participation Level'
        field={'travelDetails.participationLevel'}
      >
        { participationLevels.map((participationLevel, i) =>
          <MenuItem key={i} value={participationLevel}>{participationLevel}</MenuItem>
        ) }
      </SmartInput>
      <SmartInput
        component={Select}
        label='Primary Method of Travel'
        field={'travelDetails.primaryMethodOfTravel'}
      >
        { primaryMethodsOfTravel.map((method, i) =>
          <MenuItem key={i} value={method}>{method}</MenuItem>
        ) }
      </SmartInput>
      <BackNextButtons />
    </div>
  }
}
