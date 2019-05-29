import React from 'react'
import { observable } from 'mobx'
import { inject, observer } from 'mobx-react'
import { format, parseISO } from 'date-fns'
import { get } from 'lodash'
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

import FilterPane from './FilterPane'

import styles from './styles.scss'

@inject('TripStore') @observer
class TravelRequests extends React.Component {
  columns = [
    {
      label: 'ID',
      property: 'id',
      value: trip => trip.id,
      sortable: true
    },
    {
      label: 'Fiscal Year',
      property: 'FundingPeriod.fiscalYear',
      value: trip => get(trip, 'FundingPeriod.fiscalYear', ''),
      sortable: true
    },
    {
      label: 'Status',
      property: 'status',
      value: trip => trip.status,
      sortable: true
    },
    {
      label: 'Traveler',
      property: 'firstName',
      value: trip => `${trip.firstName} ${trip.lastName}`,
      sortable: true
    },
    {
      label: 'Submission',
      property: 'createdAt',
      value: trip => format(parseISO(trip.createdAt), 'MMM do, yyyy h:mma'),
      sortable: true
    },
    {
      label: 'Actions',
      value: trip =>
        <IconButton
          size='small'
          component={React.forwardRef((props, ref) =>
            <Link to={`/admin/trips/${trip.id}`} ref={ref} {...props} />)}>
          <Icon>edit</Icon>
        </IconButton>
    }
  ]

  componentDidMount () {
    this.props.TripStore.fetchTrips()
  }

  handleSort = (ev, column) => {
    const { TripStore } = this.props

    if (TripStore.sortProperty === column.property) {
      TripStore.sortDirection = TripStore.sortDirection === 'asc'
        ? 'desc'
        : 'asc'
    }
    TripStore.sortProperty = column.property
  }

  render () {
    const { TripStore } = this.props
    return <Paper>
      <TripToolbar columns={this.columns} />
      <Table>
        <Head
          sortDirection={TripStore.sortDirection}
          sortProperty={TripStore.sortProperty}
          columns={this.columns}
          onSort={this.handleSort}
        />
        <Body
          loading={TripStore.fetching}
          trips={TripStore.tripsOnCurrentPage}
          columns={this.columns}
        />
      </Table>
      <TripPagination />
    </Paper>
  }
}

@inject('TripStore') @observer
class TripToolbar extends React.Component {
  @observable showFilterPane = false

  render () {
    const { TripStore, columns } = this.props

    return <Toolbar>
      <Typography variant='h6' id='tableTitle'>
        Travel Requests
      </Typography>
      <div className={styles.toolbarActions}>
        <TextField
          className={styles.searchField}
          label='Search by ID or faculty name'
          fullWidth
          value={TripStore.searchText}
          onChange={ev => { TripStore.searchText = ev.target.value }}
        />
        <IconButton
          onClick={() => { this.showFilterPane = true }}>
          <Icon>filter_list</Icon>
        </IconButton>
        <IconButton component='a' href='/api/trips/export'>
          <Icon>arrow_downward</Icon>
        </IconButton>
      </div>
      <FilterPane
        open={this.showFilterPane}
        onClose={() => { this.showFilterPane = false }}
        propertyNameDisplay={property =>
          columns.find(x => x.property === property).label}
        filterableProperties={TripStore.filterable}
        filters={TripStore.filters}
        filterOptions={TripStore.filterOptions}
        onFilterChange={filters => { TripStore.filters = filters }}
      />
    </Toolbar>
  }
}

const Head = observer(({ sortDirection, sortProperty, columns, onSort }) =>
  <TableHead>
    <TableRow>
      {columns.map(column =>
        <TableCell key={column.label}>
          {column.sortable
            ? (
              <TableSortLabel
                direction={sortDirection}
                active={sortProperty === column.property}
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

const Body = observer(({ loading, trips, columns }) =>
  <TableBody>
    { loading &&
      <TableRow className={styles.progressRow}>
        <TableCell colSpan={columns.length}>
          <LinearProgress />
        </TableCell>
      </TableRow> }
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

@inject('TripStore') @observer
class TripPagination extends React.Component {
  render () {
    const { TripStore } = this.props
    return <TablePagination
      component='div'
      count={TripStore.filteredTrips.length}
      page={TripStore.page}
      rowsPerPage={TripStore.rowsPerPage}
      rowsPerPageOptions={[10, 25, 50]}
      onChangePage={(_, page) => { TripStore.page = page }}
      onChangeRowsPerPage={ev => { TripStore.rowsPerPage = ev.target.value }}
    />
  }
}

export default TravelRequests
