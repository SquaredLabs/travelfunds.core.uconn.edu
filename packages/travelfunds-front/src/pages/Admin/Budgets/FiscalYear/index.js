import React from 'react'
import { action, computed } from 'mobx'
import { inject, observer } from 'mobx-react'
import Typography from '@material-ui/core/Typography'
import BudgetsCard from './BudgetsCard'
import FundingPeriodCard from './FundingPeriodCard'

import styles from './styles.scss'

@inject('BudgetStore', 'FundingPeriodStore', 'UiState') @observer
class FiscalYear extends React.Component {
  componentDidMount () {
    this.props.FundingPeriodStore.fetch()
    this.props.BudgetStore.fetch()
  }

  get year () {
    return this.props.match.params.year
  }

  @computed get budgets () {
    return this.props.BudgetStore.byYear(this.year)
  }

  @computed get fundingPeriods () {
    return this.props.FundingPeriodStore.byYear(this.year)
  }

  @action async saveBudgets () {
    const { BudgetStore, UiState } = this.props
    try {
      await Promise.all(this.budgets
        .map(budget => budget.id)
        .map(id => BudgetStore.update(id)))
      await BudgetStore.fetch()
    } catch (err) {
      UiState.addSnackbarMessage(
        'Failed to update budgets. Please try again later.',
        'failure'
      )
      console.error(err)
      return
    }
    UiState.addSnackbarMessage('Successfully updated budgets', 'success')
  }

  @action async saveFundingPeriod (fundingPeriod) {
    const { FundingPeriodStore, UiState } = this.props
    try {
      await FundingPeriodStore.update(fundingPeriod.id)
      await FundingPeriodStore.fetch()
    } catch (err) {
      UiState.addSnackbarMessage(
        'Failed to update funding period. Please try again later.',
        'failure'
      )
      console.error(err)
      return
    }
    UiState.addSnackbarMessage('Successfully updated funding period', 'success')
  }

  render () {
    const { BudgetStore, FundingPeriodStore, match } = this.props
    const year = match.params.year
    const fundingPeriods = FundingPeriodStore.byYear(year) || []
    const budgets = BudgetStore.byYear(year) || []

    return <div className={styles.container}>
      <Typography
        className={styles.heading}
        variant='h4'
        component='h1'>
        Fiscal Year {year}
      </Typography>
      <BudgetsCard
        budgets={budgets}
        onSave={() => this.saveBudgets()}
      />
      <div className={styles.FundingPeriodCards}>
        {fundingPeriods.map(fundingPeriod =>
          <FundingPeriodCard
            key={fundingPeriod.id}
            fundingPeriod={fundingPeriod}
            onSave={() => this.saveFundingPeriod(fundingPeriod)}
          />)}
      </div>
    </div>
  }
}

export default FiscalYear
