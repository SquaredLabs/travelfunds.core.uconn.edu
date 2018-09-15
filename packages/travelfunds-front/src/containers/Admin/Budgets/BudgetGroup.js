import React from 'react'
import { observer } from 'mobx-react'

import Button from '@material-ui/core/Button'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'

import BudgetRow from './BudgetRow'

import styles from './styles.scss'

@observer
export default class BudgetGroup extends React.Component {
  render () {
    const { budgets, year, onSave } = this.props
    return <Card className={styles.budgetGroup}>
      <CardContent>
        <Typography gutterBottom variant="headline" component="h1">
          {year}
        </Typography>
        {budgets.map(budget =>
          <BudgetRow key={budget.id} budget={budget} /> )}
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
