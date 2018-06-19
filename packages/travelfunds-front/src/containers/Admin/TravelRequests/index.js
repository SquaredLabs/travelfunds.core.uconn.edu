import React from 'react'
import { action, computed, observable, runInAction } from 'mobx'
import { observer } from 'mobx-react'
import fetch from 'isomorphic-fetch'
import { format } from 'date-fns'
import { Link } from 'react-router-dom'

import Paper from '@material-ui/core/Paper'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TablePagination from '@material-ui/core/TablePagination'
import TableSortLabel from '@material-ui/core/TableSortLabel'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import Icon from '@material-ui/core/Icon'
import IconButton from '@material-ui/core/IconButton'
import TextField from '@material-ui/core/TextField'

import styles from './styles.scss'

@observer
class TravelRequests extends React.Component {
  @observable trips = []
  @observable page = 0
  @observable rowsPerPage = 25
  @observable sortDirection = 'desc'
  @observable sortColumn = 'ID'
  @observable searchText = ''

  columns = [
    {
      label: 'ID',
      value: trip => trip.id,
      getSortProperty: trip => trip.id
    },
    {
      label: 'Fiscal Year',
      value: trip => trip.fiscalYear,
      getSortProperty: trip => trip.fiscalYear
    },
    {
      label: 'Status',
      value: trip => trip.status,
      getSortProperty: trip => trip.status
    },
    {
      label: 'Traveler',
      value: trip => `${trip.firstName} ${trip.lastName}`,
      getSortProperty: trip => `${trip.firstName} ${trip.lastName}`
    },
    {
      label: 'Event Start',
      value: trip => format(trip.duration[0], 'MMM Do YYYY'),
      getSortProperty: trip => trip.duration[0]
    },
    {
      label: 'Actions',
      value: trip =>
        <IconButton component={props =>
          <Link to={`/admin/trips/${trip.id}`} {...props} />}>
          <Icon>edit</Icon>
        </IconButton>
    }
  ]

  @action async fetchTrips () {
    const res = await fetch('/api/trips', { credentials: 'include' })
    const json = await res.json()
    runInAction(() => {
      this.trips = json
    })
  }

  componentDidMount () {
    this.fetchTrips()
  }

  handleSort = (ev, column) => {
    if (this.sortColumn === column.label) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc'
    }
    this.sortColumn = column.label
  }

  @computed get sortedTrips () {
    const column = this.columns.find(x => x.label === this.sortColumn)
    return this.trips.sort((a, b) => {
      const aProp = column.getSortProperty(a)
      const bProp = column.getSortProperty(b)

      if (aProp === bProp) return 0
      if (aProp < bProp) return this.sortDirection === 'asc' ? -1 : 1
      if (aProp > bProp) return this.sortDirection === 'asc' ? 1 : -1
    })
  }

  @computed get filteredTrips () {
    const searchText = this.searchText.toLowerCase()

    if (searchText === '') {
      return this.sortedTrips
    }

    return this.sortedTrips
      .filter(x => {
        const name = `${x.firstName.toLowerCase()} ${x.lastName.toLowerCase()}`

        return [
          name.indexOf(searchText) >= 0,
          x.id === parseInt(searchText)
        ].some(x => x)
      })
  }

  @computed get tripsOnCurrentPage () {
    return this.filteredTrips.slice(
      this.page * this.rowsPerPage,
      (this.page + 1) * this.rowsPerPage
    )
  }

  render () {
    return <Paper>
      <TripToolbar
        searchText={this.searchText}
        onSearchChange={ev => { this.searchText = ev.target.value.trim() }}
      />
      <Table>
        <Head
          sortDirection={this.sortDirection}
          sortColumn={this.sortColumn}
          columns={this.columns}
          onSort={this.handleSort}
        />
        <Body
          trips={this.tripsOnCurrentPage}
          columns={this.columns}
        />
      </Table>
      <TablePagination
        component='div'
        count={this.filteredTrips.length}
        page={this.page}
        rowsPerPage={this.rowsPerPage}
        rowsPerPageOptions={[10, 25, 50]}
        onChangePage={(_, page) => { this.page = page }}
        onChangeRowsPerPage={ev => { this.rowsPerPage = ev.target.value }}
      />
    </Paper>
  }
}

const TripToolbar = observer(({ searchText, onSearchChange }) =>
  <Toolbar>
    <Typography variant='title' id='tableTitle'>
      Travel Requests
    </Typography>
    <div className={styles.toolbarActions}>
      <TextField
        label='Search by ID or faculty name'
        fullWidth
        value={searchText}
        onChange={onSearchChange}
      />
    </div>
  </Toolbar>
)

const Head = observer(({ sortDirection, sortColumn, columns, onSort }) =>
  <TableHead >
    <TableRow>
      {columns.map(column =>
        <TableCell key={column.label}>
          {column.getSortProperty
            ? (
              <TableSortLabel
                direction={sortDirection}
                active={sortColumn === column.label}
                onClick={ev => onSort(ev, column)}
                children={column.label}
              />
            )
            : column.label}
        </TableCell>
      )}
    </TableRow>
  </TableHead>
)

const Body = observer(({ trips, columns }) =>
  <TableBody>
    {trips.map(trip =>
      <TableRow
        key={trip.id}
        hover>
        {columns.map(column =>
          <TableCell key={column.label}>{column.value(trip)}</TableCell>
        )}
      </TableRow>)}
  </TableBody>
)

export default TravelRequests
