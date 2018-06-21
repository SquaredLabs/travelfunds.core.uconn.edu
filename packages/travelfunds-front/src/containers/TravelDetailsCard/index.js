import React from 'react'
import { inject, observer } from 'mobx-react'
import { format } from 'date-fns'

import Select from 'components/FormControlSelect'
import MenuItem from '@material-ui/core/MenuItem'
import DatePicker from 'material-ui-pickers/DatePicker'

import SmartInput from 'containers/SmartInput'
import BackNextButtons from 'containers/BackNextButtons'
import { participationLevels, primaryMethodsOfTravel } from 'config'

import styles from './styles.scss'

@inject('FormState', 'ValidationState') @observer
export default class extends React.Component {
  render () {
    const { FormState } = this.props
    return <div className={styles.container}>
      <SmartInput
        component={DatePicker}
        label='Beginning Date'
        field='travelDetails.startDate'
        InputLabelProps={{ shrink: true }}
        autoOk
        format='MMMM Do, YYYY'
        placeholder={format(new Date(), 'MMMM Do, YYYY')}
      />
      <SmartInput
        component={DatePicker}
        label='End Date'
        field='travelDetails.endDate'
        InputLabelProps={{ shrink: true }}
        autoOk
        format='MMMM Do, YYYY'
        minDate={FormState.travelDetails.startDate}
        placeholder={format(new Date(), 'MMMM Do, YYYY')}
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
