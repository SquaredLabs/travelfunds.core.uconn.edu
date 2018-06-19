import React from 'react'
import { action, observable } from 'mobx'
import { inject, observer } from 'mobx-react'
import fetch from 'isomorphic-fetch'
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

import styles from './styles.scss'

@inject('UiState') @observer
export default class TravelRequestEdit extends React.Component {
  trip = null
  budgets = null
  fairShareLeft = null

  grants = []

  @observable fetching = false
  @observable status = null
  @observable response = ''

  async fetchTrip () {
    const res = await fetch(`/api/trips/${this.props.match.params.id}`, {
      credentials: 'include'
    })
    this.trip = await res.json()
    this.response = this.trip.response
    this.status = this.trip.status
  }

  async fetchBudgets () {
    const res = await fetch(`/api/trips/${this.props.match.params.id}/budgets`, {
      credentials: 'include'
    })
    this.budgets = await res.json()
  }

  async fetchFairShareLeft () {
    const res = await fetch(`/api/trips/${this.props.match.params.id}/fairshareleft`, {
      credentials: 'include'
    })
    this.fairShareLeft = await res.text()
  }

  async componentDidMount () {
    this.fetching = true
    await Promise.all([
      this.fetchTrip(),
      this.fetchBudgets(),
      this.fetchFairShareLeft()
    ])
    this.fetching = false
  }

  postGrants () {
    return fetch(`/api/trips/${this.props.match.params.id}/grants`, {
      method: 'put',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.grants.map(grant =>
        ({ ...grant, amount: grant.amount.toString() })))
    })
  }

  postTripUpdates () {
    return fetch(`/api/trips/${this.props.match.params.id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: this.status, response: this.response })
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
    await fetch(`/api/trips/${this.props.match.params.id}/send-email-update`, {
      method: 'POST',
      credentials: 'include'
    })
    this.props.history.push('/admin/trips')
  }

  render () {
    return <div className={styles.container}>
      { this.trip &&
        <TripInformation trip={this.trip} /> }
      { !this.fetching && this.trip && this.budgets &&
        <GrantedFundsTable
          budgets={this.budgets}
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
      { !this.fetching && this.trip && this.budgets &&
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
