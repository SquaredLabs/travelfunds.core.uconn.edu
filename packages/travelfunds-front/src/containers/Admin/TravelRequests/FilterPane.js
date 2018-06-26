import React from 'react'
import Popover from '@material-ui/core/Popover'

import styles from './styles.scss'

export default ({ ...rest }) =>
  <Popover {...rest}>
    <div className={styles.filterPane}>
      Pending filter toggled
    </div>
  </Popover>
