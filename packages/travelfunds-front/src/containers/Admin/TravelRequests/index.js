import React from 'react'
import { action, computed, observable } from 'mobx'
import { observer } from 'mobx-react'
import fetch from 'isomorphic-fetch'
import { format } from 'date-fns'
import { Link } from 'react-router-dom'

import { withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Icon from '@material-ui/core/Icon'
import IconButton from '@material-ui/core/IconButton'

const StyledTableCell = withStyles(theme => ({
  head: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white
  }
}))(TableCell)

const styles = theme => ({
  row: {
    'transition-duration': '0.2s',
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.background.default
    }
  }
})

@observer
class TravelRequests extends React.Component {
  @observable trips = []

  @action async fetchTrips () {
    const res = await fetch('/api/trips', { credentials: 'include' })
    this.trips = await res.json()
  }

  componentDidMount () {
    this.fetchTrips()
  }

  get head () {
    return <TableHead>
      <TableRow>
        <StyledTableCell>ID</StyledTableCell>
        <StyledTableCell>Status</StyledTableCell>
        <StyledTableCell>Traveler</StyledTableCell>
        <StyledTableCell>Event Start</StyledTableCell>
        <StyledTableCell>Actions</StyledTableCell>
      </TableRow>
    </TableHead>
  }

  @computed get body () {
    const { classes } = this.props
    return <TableBody>
      {this.trips.map(trip =>
        <TableRow
          key={trip.id}
          className={classes.row}
          hover>
          <StyledTableCell>{trip.id}</StyledTableCell>
          <StyledTableCell>{trip.status}</StyledTableCell>
          <StyledTableCell>{`${trip.firstName} ${trip.lastName}`}</StyledTableCell>
          <StyledTableCell>{format(trip.duration[0], 'MMM Do YYYY')}</StyledTableCell>
          <StyledTableCell>
            <IconButton component={props =>
              <Link to={`/admin/trips/${trip.id}`} {...props} />}>
              <Icon>edit</Icon>
            </IconButton>
          </StyledTableCell>
        </TableRow>)}
    </TableBody>
  }

  render () {
    return <Paper>
      <Table>
        {this.head}
        {this.body}
      </Table>
    </Paper>
  }
}

export default withStyles(styles)(TravelRequests)
