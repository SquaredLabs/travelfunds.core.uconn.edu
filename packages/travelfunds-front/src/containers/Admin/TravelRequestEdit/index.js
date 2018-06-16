import React from 'react'
import { action, observable } from 'mobx'
import { inject, observer } from 'mobx-react'
import fetch from 'isomorphic-fetch'
import { Link } from 'react-router-dom'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Icon from '@material-ui/core/Icon'
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
  @observable response = ''

  async fetchTrip () {
    const res = await fetch(`/api/trips/${this.props.match.params.id}`, {
      credentials: 'include'
    })
    this.trip = await res.json()
    this.response = this.trip.response
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

  postResponseMessage () {
    return fetch(`/api/trips/${this.props.match.params.id}/response`, {
      method: 'put',
      credentials: 'include',
      body: this.response
    })
  }

  @action async save () {
    const { UiState } = this.props
    try {
      const responses = await Promise.all([
        this.postGrants(),
        this.postResponseMessage()
      ])
      if (responses.some(x => x.status !== 201)) throw new Error()
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
