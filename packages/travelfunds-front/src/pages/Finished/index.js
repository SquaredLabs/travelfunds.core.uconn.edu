import React from 'react'
import { inject, observer } from 'mobx-react'

import Done from 'material-ui/svg-icons/action/done'
import {green500} from 'material-ui/styles/colors'

import lang from 'lang/en_US'
import styles from './styles.scss'

@inject('FormState') @observer
export default class extends React.Component {
  render () {
    return <div className={styles.container}>
      <h1 className={styles.heading}>Request Submitted</h1>
      <p>{lang.finished}</p>
      <Done className={styles.done} color={green500} />
    </div>
  }
}
