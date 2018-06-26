import React from 'react'
import { action, computed, observable, reaction } from 'mobx'
import { observer } from 'mobx-react'
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
import LinearProgress from '@material-ui/core/LinearProgress'

import { getAll } from 'transport/trip'
import FilterPane from './FilterPane'

import styles from './styles.scss'

const defaultObservableValues = {
  rowsPerPage: 25,
  searchText: '',
  sortColumn: 'ID',
  sortDirection: 'desc',
  filters: {
    'Status': [],
    'Fiscal Year': []
  }
}

const initialObservableValues = (window.localStorage && JSON.parse(window.localStorage.getItem('travel-requests-storage')))
  ? JSON.parse(window.localStorage.getItem('travel-requests-storage'))
  : defaultObservableValues

@observer
class TravelRequests extends React.Component {
  @observable fetching = false
  @observable trips = []
  @observable page = 0
  @observable rowsPerPage = initialObservableValues.rowsPerPage || defaultObservableValues.rowsPerPage
  @observable sortDirection = initialObservableValues.sortDirection || defaultObservableValues.sortDirection
  @observable sortColumn = initialObservableValues.sortColumn || defaultObservableValues.sortColumn
  @observable searchText = initialObservableValues.searchText || defaultObservableValues.searchText
  @observable filters = initialObservableValues.filters || defaultObservableValues.filters

  columns = [
    {
      label: 'ID',
      value: trip => trip.id,
      getSortProperty: trip => trip.id
    },
    {
      label: 'Fiscal Year',
      value: trip => trip.fiscalYear,
      getSortProperty: trip => trip.fiscalYear,
      filterable: true
    },
    {
      label: 'Status',
      value: trip => trip.status,
      getSortProperty: trip => trip.status,
      filterable: true
    },
    {
      label: 'Traveler',
      value: trip => `${trip.firstName} ${trip.lastName}`,
      getSortProperty: trip => `${trip.firstName} ${trip.lastName}`.toLowerCase()
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
    this.fetching = true
    try {
      this.trips = await getAll()
    } finally {
      this.fetching = false
    }
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
    const searchText = this.searchText.trim().toLowerCase()

    return this.sortedTrips
      .filter(trip =>
        this.columns
          .map(column => !column.filterable ||
            (this.filters[column.label].length > 0
              ? this.filters[column.label].indexOf(column.value(trip)) >= 0
              : true))
          .every(x => x))
      .filter(x => {
        const name = `${x.firstName.toLowerCase()} ${x.lastName.toLowerCase()}`

        return name.indexOf(searchText) >= 0 || x.id === parseInt(searchText)
      })
  }

  @computed get tripsOnCurrentPage () {
    return this.filteredTrips.slice(
      this.page * this.rowsPerPage,
      (this.page + 1) * this.rowsPerPage
    )
  }

  @computed get filterOptions () {
    return this.columns
      .filter(x => x.filterable)
      .reduce((acc, column) => ({
        ...acc,
        [column.label]: [...new Set(this.trips.map(column.value))]
      }), {})
  }

  componentWillMount () {
    if (window.localStorage) {
      reaction(
        () => Object.keys(defaultObservableValues).map(key => this[key]),
        () => window.localStorage.setItem(
          'travel-requests-storage',
          JSON.stringify(Object
            .keys(defaultObservableValues)
            .reduce((acc, key) => ({ ...acc, [key]: this[key] }), {}))),
        {
          fireImmediately: true,
          delay: 500
        }
      )
    }
  }

  render () {
    return <Paper>
      <TripToolbar
        searchText={this.searchText}
        onSearchChange={ev => { this.searchText = ev.target.value }}
        filters={this.filters}
        filterOptions={this.filterOptions}
        onFilterChange={filters => { this.filters = filters }}
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
      { this.fetching && <LinearProgress /> }
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

@observer
class TripToolbar extends React.Component {
  @observable showFilterPane = false

  render () {
    const {
      searchText,
      onSearchChange,
      filters,
      filterOptions,
      onFilterChange
    } = this.props
    return <Toolbar>
      <Typography variant='title' id='tableTitle'>
        Travel Requests
      </Typography>
      <div className={styles.toolbarActions}>
        <TextField
          className={styles.searchField}
          label='Search by ID or faculty name'
          fullWidth
          value={searchText}
          onChange={onSearchChange}
        />
        <IconButton
          onClick={() => { this.showFilterPane = true }}>
          <Icon>filter_list</Icon>
        </IconButton>
      </div>
      <FilterPane
        open={this.showFilterPane}
        onClose={() => { this.showFilterPane = false }}
        filters={filters}
        filterOptions={filterOptions}
        onFilterChange={onFilterChange}
      />
    </Toolbar>
  }
}

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
          <TableCell
            key={column.label}
            className={styles.tableCell}>
            {column.value(trip)}
          </TableCell>
        )}
      </TableRow>)}
  </TableBody>
)

export default TravelRequests
