import React from 'react'
import { action } from 'mobx'
import { inject, observer } from 'mobx-react'
import FundingPeriodCard from './FundingPeriodCard'

import styles from './styles.scss'

@inject('FundingPeriodStore', 'UiState') @observer
class FundingPeriods extends React.Component {
  componentDidMount () {
    this.props.FundingPeriodStore.fetch()
  }

  @action async save (fundingPeriod) {
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
    const { FundingPeriodStore } = this.props

    return <div className={styles.container}>
      {FundingPeriodStore.fundingPeriods
        .map(fundingPeriod =>
          <FundingPeriodCard
            key={fundingPeriod.id}
            fundingPeriod={fundingPeriod}
            onSave={() => this.save(fundingPeriod)}
          />)}
    </div>
  }
}

export default FundingPeriods
