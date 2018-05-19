import React from 'react'
import { inject, observer } from 'mobx-react'

import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'

import { formStepShortNames } from 'config'
import styles from './styles.scss'

@inject('FormState')
class BackButton extends React.Component {
  render () {
    const { FormState } = this.props

    return <FlatButton
      className={styles.button}
      label='Back'
      onTouchTap={() => FormState.currentFormIndex--}
    />
  }
}

@inject('FormState', 'ValidationState') @observer
class NextButton extends React.Component {
  onTouchTap () {
    const { FormState, ValidationState } = this.props
    const stepName = formStepShortNames[FormState.currentFormIndex]

    ValidationState.beginValidatingStep(stepName)
    if (ValidationState[stepName].passes) {
      FormState.currentFormIndex++
    }
  }

  disabled () {
    const { FormState, ValidationState } = this.props
    const stepName = formStepShortNames[FormState.currentFormIndex]

    return ValidationState[stepName].hasErrors
  }

  render () {
    return <RaisedButton
      className={styles.button}
      label='Next'
      onTouchTap={() => this.onTouchTap()}
      primary
      disabled={this.disabled()}
    />
  }
}

@inject('FormState', 'ValidationState', 'TransportState') @observer
class SubmitButton extends React.Component {
  onTouchTap () {
    const { FormState, ValidationState } = this.props
    const stepName = formStepShortNames[FormState.currentFormIndex]

    ValidationState.beginValidatingStep(stepName)
    if (ValidationState[stepName].passes) {
      FormState.submitForm()
    }
  }

  disabled () {
    const { FormState, ValidationState, TransportState } = this.props
    const stepName = formStepShortNames[FormState.currentFormIndex]

    const conditions = [
      ValidationState[stepName].hasErrors,
      TransportState.isSendingTravelRequest
    ]

    return conditions.some(c => c)
  }

  render () {
    return <RaisedButton
      className={styles.button}
      label='Send Request'
      onTouchTap={() => this.onTouchTap()}
      secondary
      disabled={this.disabled()}
    />
  }
}

@inject('FormState') @observer
export default class extends React.Component {
  render () {
    const { FormState } = this.props
    return <div className={styles.container}>
      { FormState.currentFormIndex > 0 && <BackButton /> }
      { FormState.currentFormIndex < 3
        ? <NextButton />
        : <SubmitButton /> }
    </div>
  }
}
