import React from 'react'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import fetch from 'isomorphic-fetch'
import TripInformation from './TripInformation'
import GrantedFundsTable from 'components/GrantedFundsTable'

@observer
export default class TravelRequestEdit extends React.Component {
  trip = null
  budgets = null
  fairShareLeft = null
  @observable fetching = false

  async fetchTrip () {
    const res = await fetch(`/api/trips/${this.props.match.params.id}`, {
      credentials: 'include'
    })
    this.trip = await res.json()
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

  render () {
    return <div>
      { this.trip &&
        <TripInformation trip={this.trip} /> }
      { !this.fetching && this.trip && this.budgets &&
        <GrantedFundsTable
          budgets={this.budgets}
          trip={this.trip}
          fairShareLeft={this.fairShareLeft}
        /> }
    </div>
  }
}
