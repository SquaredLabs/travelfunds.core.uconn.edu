import React from 'react'
import { action, observable } from 'mobx'
import { inject, observer } from 'mobx-react'
import { Link } from 'react-router-dom'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Icon from '@material-ui/core/Icon'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import FormControl from '@material-ui/core/FormControl'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormLabel from '@material-ui/core/FormLabel'
import TripInformation from './TripInformation'
import GrantedFundsTable from 'components/GrantedFundsTable'
import {
  getSingle,
  getFairShareLeft,
  getBudgetAllocations,
  update,
  postGrants,
  sendEmailUpdate
} from 'transport/trip'

import styles from './styles.scss'

export default
@inject('UiState') @observer
class TravelRequestEdit extends React.Component {
  trip = null
  budgetAllocations = null
  fairShareLeft = null

  grants = []

  @observable fetching = false
  @observable status = null
  @observable response = ''

  async fetchTrip () {
    this.trip = await getSingle(this.props.match.params.id)
    this.response = this.trip.response || ''
    this.status = this.trip.status
  }

  async fetchBudgetAllocations () {
    this.budgetAllocations = await getBudgetAllocations(this.props.match.params.id)
  }

  async fetchFairShareLeft () {
    this.fairShareLeft = await getFairShareLeft(this.props.match.params.id)
  }

  async componentDidMount () {
    this.fetching = true
    try {
      await Promise.all([
        this.fetchTrip(),
        this.fetchBudgetAllocations(),
        this.fetchFairShareLeft()
      ])
    } finally {
      this.fetching = false
    }
  }

  postGrants () {
    return postGrants(
      this.props.match.params.id,
      this.grants.map(grant =>
        ({ ...grant, amount: grant.amount.toString() })))
  }

  postTripUpdates () {
    return update(this.props.match.params.id, {
      status: this.status,
      response: this.response
    })
  }

  @action async save () {
    const { UiState } = this.props
    try {
      const responses = await Promise.all([
        this.postGrants(),
        this.postTripUpdates()
      ])
      if (responses.some(x => x.status >= 300 || x.status < 200)) throw new Error()
    } catch (err) {
      UiState.addSnackbarMessage(
        'Failed to update trip. Please try again later.',
        'failure'
      )
      return
    }
    UiState.addSnackbarMessage('Successfully updated trip grants', 'success')
  }

  @action async saveAndSendEmail () {
    await this.save()
    await sendEmailUpdate(this.props.match.params.id)
    this.props.history.push('/admin/trips')
  }

  render () {
    return <div className={styles.container}>
      { this.trip &&
        <TripInformation trip={this.trip} /> }
      { !this.fetching && this.trip && this.budgetAllocations &&
        <GrantedFundsTable
          budgetAllocations={this.budgetAllocations}
          trip={this.trip}
          fairShareLeft={this.fairShareLeft}
          onGrantsChange={grants => { this.grants = grants }}
        /> }
      { !this.fetching && this.trip &&
        <TextField
          multiline
          label='Optional message to be included in the next email to this faculty member'
          className={styles.optionalMessage}
          value={this.response}
          onChange={ev => { this.response = ev.target.value }}
        /> }
      { this.trip &&
        <FormControl component='fieldset' className={styles.statusFormControl}>
          <FormLabel component='legend'>Status</FormLabel>
          <RadioGroup
            className={styles.statusRadioGroup}
            name='status'
            value={this.status}
            onChange={(_, status) => { this.status = status }}>
            { ['Approved', 'Denied', 'Withdrawn', 'Pending', 'Disbursed']
              .map(status =>
                <FormControlLabel
                  key={status}
                  value={status}
                  control={<Radio />}
                  label={status}
                />) }
          </RadioGroup>
        </FormControl> }
      { !this.fetching && this.trip && this.budgetAllocations &&
        <div className={styles.actions}>
          <Button
            variant='raised'
            color='primary'
            onClick={() => this.saveAndSendEmail()}>
            Save & Send Email
            <Icon className={styles.iconRight}>send</Icon>
          </Button>
          <Button
            variant='raised'
            onClick={() => this.save()}>
            Save
            <Icon className={styles.iconRight}>save</Icon>
          </Button>
          <Button
            component={Link}
            to='/admin/trips'
            variant='raised'
            color='secondary'
            size='large'>
            Back
          </Button>
        </div> }
    </div>
  }
}
