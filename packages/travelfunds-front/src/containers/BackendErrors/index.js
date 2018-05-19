import React from 'react'
import { inject, observer } from 'mobx-react'

import { Card, CardTitle, CardText } from 'material-ui/Card'

import styles from './styles.scss'

function formatError (error) {
  return error.replace(/(\.)([^$])/g, ' $2')
}

@inject('FormState') @observer
export default class extends React.Component {
  render () {
    const { FormState: { backendErrors } } = this.props

    const noErrors = Object.keys(backendErrors).length === 0

    if (noErrors) {
      return null
    }

    const errorsList = Object.keys(backendErrors).map(key => (
      backendErrors[key].map(error => (
        <li>{ formatError(error) }</li>
      ))
    ))

    return <Card className={styles.container}>
      <CardTitle title='Errors' />
      <CardText>
        <ul className={styles.list}>{ errorsList }</ul>
      </CardText>
    </Card>
  }
}
