import React from 'react'
import { inject, observer } from 'mobx-react'

import Button from '@material-ui/core/Button'

import lang from 'lang/en_US'
import styles from './styles.scss'

export default
@inject('FormState') @observer
class extends React.Component {
  render () {
    return <div className={styles.container}>
      {lang.loginPage.map((msg, i) => <p key={i} dangerouslySetInnerHTML={{ __html: msg }} />)}
      <Button
        className={styles.button}
        variant='raised'
        href='/login'
        color='primary'
        children='Login'
      />
    </div>
  }
}
