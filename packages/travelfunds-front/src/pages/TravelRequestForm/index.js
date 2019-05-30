import React from 'react'
import { inject, observer } from 'mobx-react'

import Stepper from '@material-ui/core/Stepper'
import Step from '@material-ui/core/Step'
import StepButton from '@material-ui/core/StepButton'
import Icon from '@material-ui/core/Icon'

import ContactInformationCard from 'containers/ContactInformationCard'
import TravelerInformationCard from 'containers/TravelerInformationCard'
import TravelDetailsCard from 'containers/TravelDetailsCard'
import TravelCostsCard from 'containers/TravelCostsCard'
import BackendErrors from 'containers/BackendErrors'
import CardWithSidebar from 'containers/CardWithSidebar'

import ValidationState from 'stores/ValidationState'

import lang from 'lang/en_US'
import styles from './styles.scss'

const formSteps = [
  {
    title: lang.formSteps.contact,
    shortName: 'contact',
    completed: () => ValidationState.contact.passes,
    hasErrors: () => ValidationState.contact.hasErrors,
    component: ContactInformationCard
  },
  {
    title: lang.formSteps.travelDetails,
    shortName: 'travelDetails',
    completed: () => ValidationState.travelDetails.passes,
    hasErrors: () => ValidationState.travelDetails.hasErrors,
    component: TravelDetailsCard
  },
  {
    title: lang.formSteps.traveler,
    shortName: 'traveler',
    completed: () => ValidationState.traveler.passes,
    hasErrors: () => ValidationState.traveler.hasErrors,
    component: TravelerInformationCard
  },
  {
    title: lang.formSteps.travelCosts,
    shortName: 'travelCosts',
    completed: () => ValidationState.travelCosts.passes,
    hasErrors: () => ValidationState.travelCosts.hasErrors,
    component: TravelCostsCard
  }
]

@inject('FormState') @observer
class FormSteps extends React.Component {
  render () {
    const { FormState } = this.props
    return <Stepper nonLinear activeStep={FormState.currentFormIndex}>
      { formSteps.map(({ title, shortName, completed, hasErrors }, i) =>
        <Step key={i}>
          <StepButton {...{
            completed: completed(),
            onClick: () => { FormState.currentFormIndex = i },
            icon: hasErrors() ? <Icon color='error'>warning</Icon> : i + 1,
            disabled: !ValidationState[shortName].available
          }}>
            {title}
          </StepButton>
        </Step>
      ) }
    </Stepper>
  }
}

export default
@inject('FormState') @observer
class extends React.Component {
  renderStepperContent (stepIndex) {
    const Component = formSteps[stepIndex].component
    return <Component />
  }

  render () {
    const { FormState } = this.props

    return <div className={styles.container}>
      <BackendErrors />
      <CardWithSidebar className={styles.card}>
        <FormSteps />
        <div className={styles.stepperContentContainer}>
          { this.renderStepperContent(FormState.currentFormIndex) }
        </div>
      </CardWithSidebar>
    </div>
  }
}
