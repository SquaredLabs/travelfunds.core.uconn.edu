import React from 'react'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import ButtonBase from '@material-ui/core/ButtonBase'
import Paper from '@material-ui/core/Paper'
import { Link } from 'react-router-dom'
import { getAll } from 'transport/fiscal-year'

import styles from './styles.scss'

export default
@observer
class Budgets extends React.Component {
  @observable fiscalYears = []

  async componentDidMount () {
    this.fiscalYears = await getAll()
  }

  render () {
    return <div className={styles.container}>
      {this.fiscalYears.map(year =>
        <ButtonBase focusRipple key={year} className={styles.fiscalYearButton}>
          <Link to={`/admin/budgets/${year}`}>
            <Paper className={styles.fiscalYearPaper}>
              <span className={styles.year}>{year}</span>
            </Paper>
          </Link>
        </ButtonBase>)}
    </div>
  }
}
