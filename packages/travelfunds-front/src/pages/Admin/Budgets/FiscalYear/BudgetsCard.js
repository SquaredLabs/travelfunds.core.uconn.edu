import React from 'react'
import Button from '@material-ui/core/Button'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import CardHeader from '@material-ui/core/CardHeader'
import BudgetRow from './BudgetRow'

import styles from './styles.scss'

export default
function BudgetsCard (props) {
  return <Card className={styles.BudgetsCard}>
    <CardHeader title='Budgets' />
    <CardContent>
      {props.budgets.map(budget =>
        <BudgetRow key={budget.id} budget={budget} />)}
    </CardContent>
    <CardActions className={styles.budgetGroupActions}>
      <Button
        color='primary'
        size='small'
        variant='raised'
        onClick={props.onSave}>
        Save
      </Button>
    </CardActions>
  </Card>
}
