import React from 'react'
import Paper from '@material-ui/core/Paper'
import Divider from '@material-ui/core/Divider'
import { format } from 'date-fns'
import styles from './styles.scss'

export default ({ trip }) =>
  <Paper className={styles.tripInformation}>
    <h1>Travel Request {trip.id}</h1>
    <Divider />
    <h2>Traveler</h2>
    <dl>
      <dt>Contact</dt>
      {trip.contactEmail
        ? <dd>{trip.contactEmail}</dd>
        : <dd>No contact entered</dd>}

      <dt>Name</dt>
      <dd>{trip.firstName} {trip.lastName}</dd>

      <dt>NetID</dt>
      <dd>{trip.netid}</dd>

      <dt>Department</dt>
      <dd>{trip.department}</dd>

      <dt>Title</dt>
      <dd>{trip.title}</dd>

      <dt>Terminal Degree Year</dt>
      <dd>{trip.yearOfTerminalDegree}{trip.isForSenior ? ' (senior)' : ''}</dd>
    </dl>
    <h2>Trip</h2>
    <dl>
      <dt>Period</dt>
      <dd>
        {format(trip.startDate, 'MMMM Do, YYYY')} –
        {format(trip.endDate, 'MMMM Do, YYYY')}
      </dd>
      <dt>Destination</dt><dd>{trip.destination}</dd>
      <dt>Event Title</dt><dd>{trip.eventTitle}</dd>
      <dt>Participation Level</dt><dd>{trip.participationLevel}</dd>
      <dt>Method of Travel</dt><dd>{trip.primaryMethodOfTravel}</dd>
    </dl>
  </Paper>
