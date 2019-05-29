import React from 'react'
import { inject, observer } from 'mobx-react'
import { format } from 'date-fns'

import Select from 'components/FormControlSelect'
import MenuItem from '@material-ui/core/MenuItem'
import { DatePicker } from '@material-ui/pickers'

import SmartInput from 'containers/SmartInput'
import BackNextButtons from 'containers/BackNextButtons'
import { participationLevels, primaryMethodsOfTravel } from 'config'

import styles from './styles.scss'

export default
@inject('FormState', 'ValidationState') @observer
class extends React.Component {
  render () {
    const { FormState } = this.props
    return <div className={styles.container}>
      <SmartInput
        component={DatePicker}
        label='Beginning Date'
        field='travelDetails.startDate'
        InputLabelProps={{ shrink: true }}
        autoOk
        format='MMMM do, yyyy'
        placeholder={format(new Date(), 'MMMM do, yyyy')}
      />
      <SmartInput
        component={DatePicker}
        label='End Date'
        field='travelDetails.endDate'
        InputLabelProps={{ shrink: true }}
        autoOk
        format='MMMM do, yyyy'
        minDate={FormState.travelDetails.startDate}
        placeholder={format(new Date(), 'MMMM do, yyyy')}
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
