import React from 'react'
import { action, observable } from 'mobx'
import { observer } from 'mobx-react'
import { format, toDate } from 'date-fns'
import { Link } from 'react-router-dom'
import { getActive } from '../../transport/funding-period'

import styles from './styles.scss'

export default
@observer
class extends React.Component {
  @observable fundingPeriods = []

  @action async componentDidMount () {
    this.fundingPeriods = await getActive()
  }

  render () {
    return <ul className={styles.FundingPeriodList}>
      {this.fundingPeriods.map(x =>
        <FundingPeriodRow key={x.id} fundingPeriod={x} />)}
    </ul>
  }
}

class FundingPeriodRow extends React.Component {
  formatBoundaryDate (value) {
    const date = toDate(value)
    return format(date, 'MMMM Do, YYYY')
  }

  render () {
    const { fundingPeriod } = this.props

    return <li className={styles.FundingPeriodRow}>
      <Link to={`/funding-periods/${fundingPeriod.id}`}>
        { fundingPeriod.name }: { this.formatBoundaryDate(fundingPeriod.period[0].value) } - { this.formatBoundaryDate(fundingPeriod.period[1].value) }
      </Link>
    </li>
  }
}
