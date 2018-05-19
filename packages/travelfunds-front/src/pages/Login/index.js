import React from 'react'
import { inject, observer } from 'mobx-react'

import RaisedButton from 'material-ui/RaisedButton'

import lang from 'lang/en_US'
import styles from './styles.scss'

@inject('FormState') @observer
export default class extends React.Component {
  render () {
    return <div className={styles.container}>
      {lang.loginPage.map((msg, i) => <p key={i} dangerouslySetInnerHTML={{ __html: msg }} />)}
      <RaisedButton
        className={styles.button}
        label='Login'
        href='/user/login'
        primary
      />
    </div>
  }
}
