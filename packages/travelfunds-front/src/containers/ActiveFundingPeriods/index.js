import React from 'react'
import { inject, observer } from 'mobx-react'
import { format, isBefore, parseISO, subDays } from 'date-fns'

import styles from './styles.scss'

export default
@inject('FundingPeriodStore') @observer
class ActiveFundingPeriods extends React.Component {
  render () {
    const { FundingPeriodStore } = this.props

    return <div className={styles.container}>
      {FundingPeriodStore.openFundingPeriods.length > 0 &&
        <p>Submissions are open for trips that fall in the following funding periods.</p>}
      <FundingPeriodList fundingPeriods={FundingPeriodStore.openFundingPeriods} />
      {FundingPeriodStore.upcomingFundingPeriods.length > 0 &&
        <p>You may submit funding requests for the following after the corresponding open dates.</p>}
      <FundingPeriodList fundingPeriods={FundingPeriodStore.upcomingFundingPeriods} />
    </div>
  }
}

class FundingPeriodList extends React.Component {
  render () {
    const { fundingPeriods } = this.props
    return <ul>
      {fundingPeriods.map(fundingPeriod =>
        <FundingPeriodListItem
          key={fundingPeriod.id}
          fundingPeriod={fundingPeriod}
        />)}
    </ul>
  }
}

class FundingPeriodListItem extends React.Component {
  displayDate (isoString) {
    return format(parseISO(isoString), 'MMMM do, yyyy')
  }

  displayEndIntervalDate (isoString) {
    return format(subDays(parseISO(isoString), 1), 'MMMM do, yyyy')
  }

  render () {
    const { fundingPeriod: { period, open } } = this.props
    return <li>
      <strong>{this.displayDate(period[0].value)}</strong> to <strong>{this.displayDate(period[1].value)}</strong> {isBefore(parseISO(open[0].value), new Date()) ? 'opened' : 'opens'} on <strong>{this.displayDate(open[0].value)}</strong>
    </li>
  }
}
