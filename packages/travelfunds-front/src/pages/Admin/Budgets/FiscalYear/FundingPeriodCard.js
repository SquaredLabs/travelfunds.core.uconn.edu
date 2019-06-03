import React from 'react'
import { observer } from 'mobx-react'
import { addDays, format, subDays, parseISO } from 'date-fns'

import Button from '@material-ui/core/Button'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import InputAdornment from '@material-ui/core/InputAdornment'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import { DatePicker } from '@material-ui/pickers'

import styles from './styles.scss'

export default
@observer
class FundingPeriodCard extends React.Component {
  getDateRightBoundaryValue = boundary =>
    boundary.inclusive
      ? parseISO(boundary.value)
      : subDays(parseISO(boundary.value), 1)

  setDateRightBoundaryValue = (boundary, newValue) => {
    const newDate = boundary.inclusive
      ? newValue
      : addDays(newValue, 1)
    boundary.value = format(newDate, 'yyyy-MM-dd')
  }

  render () {
    const { fundingPeriod, onSave } = this.props
    return <Card className={styles.FundingPeriodCard}>
      <CardContent>
        <Typography gutterBottom variant='h6' component='h1'>
          Funding Period: {fundingPeriod.name}
        </Typography>
        <div className={styles.fundingPeriodFields}>
          <TextField
            label='Name'
            value={fundingPeriod.name}
            onChange={ev => { fundingPeriod.name = ev.target.value }}
            variant='filled'
          />
          <br />
          <DatePicker
            label='Start Date'
            value={parseISO(fundingPeriod.period[0].value)}
            onChange={newDate => {
              fundingPeriod.period[0].value = format(newDate, 'yyyy-MM-dd')
            }}
            autoOk
            format='MMMM do, yyyy'
          />
          <DatePicker
            label='End Date'
            value={this.getDateRightBoundaryValue(fundingPeriod.period[1])}
            onChange={newDate =>
              this.setDateRightBoundaryValue(fundingPeriod.period[1], newDate)}
            autoOk
            format='MMMM do, yyyy'
          />
          <DatePicker
            label='Open For Submissions Date'
            value={parseISO(fundingPeriod.open[0].value)}
            onChange={newDate => {
              fundingPeriod.open[0].value = format(newDate, 'yyyy-MM-dd')
            }}
            autoOk
            format='MMMM do, yyyy'
          />
          <DatePicker
            label='Closed For Submissions Date'
            value={this.getDateRightBoundaryValue(fundingPeriod.open[1])}
            onChange={newDate =>
              this.setDateRightBoundaryValue(fundingPeriod.open[1], newDate)}
            autoOk
            format='MMMM do, yyyy'
          />
        </div>
        {fundingPeriod.BudgetAllocations.map(budgetAllocation =>
          <TextField
            key={budgetAllocation.id}
            className={styles.budgetAllocationInput}
            label={budgetAllocation.Budget.name}
            variant='outlined'
            type='number'
            placeholder='0'
            value={budgetAllocation.amount}
            onChange={ev => { budgetAllocation.amount = ev.target.value }}
            InputProps={{
              startAdornment: <InputAdornment position='start'>$</InputAdornment>
            }}
          />
        )}
      </CardContent>
      <CardActions className={styles.budgetGroupActions}>
        <Button
          color='primary'
          size='small'
          variant='contained'
          onClick={onSave}>
          Save
        </Button>
      </CardActions>
    </Card>
  }
}
