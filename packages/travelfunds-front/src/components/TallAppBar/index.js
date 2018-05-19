import React from 'react'

import AppBar from 'material-ui/AppBar'
import muiThemeable from 'material-ui/styles/muiThemeable'

import styles from './styles.scss'

// This is the extended height app bar that is seen on the Material Design
// homepage. I could not find it in Material-UI.

const TallAppBar = ({ muiTheme, title, ...rest }) => (
  <div>
    <AppBar {...rest} style={{ boxShadow: 'none' }} />
    <div
      className={styles.container}
      style={{ backgroundColor: muiTheme.palette.primary1Color }}
    >
      {title}
    </div>
  </div>
)

export default muiThemeable()(TallAppBar)
