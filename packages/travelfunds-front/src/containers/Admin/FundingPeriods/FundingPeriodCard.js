import React from 'react'
import { observer } from 'mobx-react'
import { addDays, format, toDate, subDays } from 'date-fns'

import Button from '@material-ui/core/Button'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import DatePicker from 'material-ui-pickers/DatePicker'
import Divider from '@material-ui/core/Divider'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'

import BudgetRow from './BudgetRow'

import styles from './styles.scss'

export default
@observer
class FundingPeriodCard extends React.Component {
  getDateRightBoundaryValue = boundary =>
    boundary.inclusive
      ? toDate(boundary.value)
      : subDays(toDate(boundary.value), 1)

  setDateRightBoundaryValue = (boundary, newValue) => {
    const newDate = boundary.inclusive
      ? newValue
      : addDays(newValue, 1)
    boundary.value = format(newDate, 'YYYY-MM-DD')
  }

  render () {
    const { fundingPeriod, onSave } = this.props
    return <Card className={styles.FundingPeriodCard}>
      <CardContent>
        <Typography gutterBottom variant='headline' component='h1'>
          Funding Period: {fundingPeriod.name}
        </Typography>
        <div className={styles.fundingPeriodFields}>
          <TextField
            label='Name'
            value={fundingPeriod.name}
            onChange={ev => { fundingPeriod.name = ev.target.value }}
          />
          <TextField
            label='Fiscal Year'
            value={fundingPeriod.fiscalYear}
          />
          <DatePicker
            label='Start Date'
            value={toDate(fundingPeriod.period[0].value)}
            onChange={newDate => {
              fundingPeriod.period[0].value = format(newDate, 'YYYY-MM-DD')
            }}
            format='MMMM Do, YYYY'
          />
          <DatePicker
            label='End Date'
            value={this.getDateRightBoundaryValue(fundingPeriod.period[1])}
            onChange={newDate =>
              this.setDateRightBoundaryValue(fundingPeriod.period[1], newDate)}
            format='MMMM Do, YYYY'
          />
          <DatePicker
            label='Open For Submissions Date'
            value={toDate(fundingPeriod.open[0].value)}
            onChange={newDate => {
              fundingPeriod.open[0].value = format(newDate, 'YYYY-MM-DD')
            }}
            format='MMMM Do, YYYY'
          />
          <DatePicker
            label='Closed For Submissions Date'
            value={this.getDateRightBoundaryValue(fundingPeriod.open[1])}
            onChange={newDate =>
              this.setDateRightBoundaryValue(fundingPeriod.open[1], newDate)}
            format='MMMM Do, YYYY'
          />
        </div>
      </CardContent>
      <Divider />
      <CardContent>
        {fundingPeriod.Budgets.map(budget =>
          <BudgetRow key={budget.id} budget={budget} />)}
      </CardContent>
      <CardActions className={styles.budgetGroupActions}>
        <Button
          color='primary'
          size='small'
          variant='raised'
          onClick={onSave}>
          Save
        </Button>
      </CardActions>
    </Card>
  }
}
