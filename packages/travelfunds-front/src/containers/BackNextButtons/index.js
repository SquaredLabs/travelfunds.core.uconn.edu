import React from 'react'
import { inject, observer } from 'mobx-react'

import Button from '@material-ui/core/Button'

import { formStepShortNames } from 'config'
import styles from './styles.scss'

@inject('FormState')
class BackButton extends React.Component {
  render () {
    const { FormState } = this.props

    return <Button
      className={styles.button}
      onClick={() => FormState.currentFormIndex--}
      children='Back'
    />
  }
}

@inject('FormState', 'ValidationState') @observer
class NextButton extends React.Component {
  onClick () {
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
    return <Button
      className={styles.button}
      variant='raised'
      onClick={() => this.onClick()}
      color='primary'
      disabled={this.disabled()}
      children='Next'
    />
  }
}

@inject('FormState', 'ValidationState', 'TransportState') @observer
class SubmitButton extends React.Component {
  onClick () {
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
    return <Button
      className={styles.button}
      variant='raised'
      onClick={() => this.onClick()}
      color='secondary'
      disabled={this.disabled()}
      children='Send Request'
    />
  }
}

export default
@inject('FormState') @observer
class BackNextButtons extends React.Component {
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
