import React from 'react'
import { inject, observer } from 'mobx-react'
import ButtonBase from '@material-ui/core/ButtonBase'
import Paper from '@material-ui/core/Paper'
import { Link } from 'react-router-dom'
import CreateNewFiscalYearForm from 'components/CreateNewFiscalYearForm'

import styles from './styles.scss'

export default
@inject('FiscalYearStore')
@observer
class Budgets extends React.Component {
  componentDidMount () {
    this.props.FiscalYearStore.fetch()
  }

  render () {
    const { FiscalYearStore } = this.props
    return <div className={styles.container}>
      {FiscalYearStore.fiscalYears.map(year =>
        <ButtonBase focusRipple key={year} className={styles.fiscalYearButton}>
          <Link to={`/admin/budgets/${year}`}>
            <Paper className={styles.fiscalYearPaper}>
              <span className={styles.year}>{year}</span>
            </Paper>
          </Link>
        </ButtonBase>)}
      <CreateNewFiscalYearForm />
    </div>
  }
}
