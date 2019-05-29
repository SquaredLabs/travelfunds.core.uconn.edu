import React from 'react'
import { observer } from 'mobx-react'
import TextField from '@material-ui/core/TextField'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Typography from '@material-ui/core/Typography'

import styles from './styles.scss'

export default
@observer
class BudgetRow extends React.Component {
  render () {
    const { budget } = this.props
    return <section className={styles.budgetRow}>
      <Typography gutterBottom variant='h6' component='h3'>
        {budget.name}
      </Typography>
      <div>
        <TextField
          className={styles.textField}
          label='KFS Number'
          value={budget.kfsNumber}
          onChange={ev => { budget.kfsNumber = ev.target.value }}
        />
        <TextField
          className={styles.textField}
          label='Senior Allocation Limit'
          value={budget.seniorAllocationLimit}
          onChange={ev => { budget.seniorAllocationLimit = ev.target.value }}
        />
      </div>
      <div>
        <FormControlLabel
          control={<Checkbox
            checked={budget.usableByLawProfessors}
            value='usableByLawProfessors'
            onChange={(ev, checked) => { budget.usableByLawProfessors = checked }}
          />}
          label='Usable by Law Professors'
        />
        <FormControlLabel
          control={<Checkbox
            checked={budget.usableForAttendanceOnly}
            value='usableForAttendanceOnly'
            onChange={(ev, checked) => { budget.usableForAttendanceOnly = checked }}
          />}
          label='Usable for Attendance Only'
        />
      </div>
    </section>
  }
}
