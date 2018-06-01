import React from 'react'
import { inject, observer } from 'mobx-react'

import Icon from '@material-ui/core/Icon'

import lang from 'lang/en_US'
import styles from './styles.scss'

@inject('FormState') @observer
export default class extends React.Component {
  render () {
    return <div className={styles.container}>
      <h1 className={styles.heading}>Request Submitted</h1>
      <p>{lang.finished}</p>
      <Icon className={styles.done} color='primary'>done</Icon>
    </div>
  }
}
