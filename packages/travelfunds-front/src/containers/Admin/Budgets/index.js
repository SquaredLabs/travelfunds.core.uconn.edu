import React from 'react'
import { action } from 'mobx'
import { inject, observer } from 'mobx-react'
import { groupBy } from 'lodash'
import BudgetGroup from './BudgetGroup'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'

import styles from './styles.scss'

@inject('BudgetStore', 'UiState') @observer
class Budgets extends React.Component {
  componentDidMount () {
    this.props.BudgetStore.fetch()
  }

  @action async save (budgets) {
    const { BudgetStore, UiState } = this.props
    try {
      const responses = await Promise.all(
        budgets.map(x => BudgetStore.update(x.id)))
      // Redownload budgets to clearly show that database state changed. This
      // also resets invalid inputs.
      await this.props.BudgetStore.fetch()
      if (responses.some(x => x.status >= 300 || x.status < 200)) throw new Error()
    } catch (err) {
      UiState.addSnackbarMessage(
        'Failed to update budgets. Please try again later.',
        'failure'
      )
      return
    }
    UiState.addSnackbarMessage('Successfully updated budgets', 'success')
  }

  render () {
    const { BudgetStore } = this.props
    const budgetsByFiscalYear = groupBy(BudgetStore.budgets, 'fiscalYear')

    return <div className={styles.container}>
      {Object.keys(budgetsByFiscalYear)
        .sort()
        .reverse()
        .map(year =>
          <BudgetGroup
            key={year}
            year={year}
            budgets={budgetsByFiscalYear[year]}
            onSave={() => this.save(budgetsByFiscalYear[year])}
          />)}
    </div>
  }
}

export default Budgets
