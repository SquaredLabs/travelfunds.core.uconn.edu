import React from 'react'

import styles from './styles.scss'

const uconnLogo = require('../../../assets/img/uconn-wordmark-single-white-small.png')

export default class UConnBanner extends React.PureComponent {
  render () {
    return <div className={styles.container}>
      <img src={uconnLogo} alt='UCONN' className={styles.UCONN} />
      <span className={styles.universityOfConnecticut}>University of Connecticut</span>
    </div>
  }
}
