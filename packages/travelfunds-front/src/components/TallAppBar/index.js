import React from 'react'

import { withTheme } from '@material-ui/core/styles'

import styles from './styles.scss'

// This is the extended height app bar that is seen on the Material Design
// homepage. I could not find it in Material-UI.

class TallAppBar extends React.PureComponent {
  render () {
    const { theme, title } = this.props
    return <div
      className={styles.container}
      style={{ backgroundColor: theme.palette.primary.main }}>
      {title}
    </div>
  }
}

export default withTheme()(TallAppBar)
