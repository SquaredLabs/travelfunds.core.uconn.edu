import { observable, computed, action, toJS } from 'mobx'
import Validator from 'validatorjs'

import FormState from 'stores/FormState'
import { rules, messages } from 'data/rules'

import { formStepShortNames } from 'config'

/*
 * Someone is going to hate me for writing all this beautiful functional
 * programming code, but I promise it makes sense.
 *
 * Functions are defined as arrow functions assigned to constants to preserve
 * lexical scoping.
 */

/*
 * Helpers to create a 1D object of observables and computations
 */

const createShallowObservables = (keys, getInitialValue) =>
  observable(keys.reduce((acc, key) => (
    { ...acc, [key]: getInitialValue(key) }
  ), {}))

const createShallowComputations = (keys, computation) =>
  createShallowObservables(keys, key => computed(() => computation(key)))

/*
 * Helpers specific to parts of the form
 */

const createFormStepObservables = (step, initialValue) =>
  createShallowObservables(Object.keys(FormState[step]), () => initialValue)

const createFormStepComputations = (step, computation) =>
  createShallowComputations(Object.keys(FormState[step]), computation)

/*
 * Validator creation
 */

const createFormStepValidator = step => {
  const validator = new Validator(FormState[step], toJS(rules[step]), messages[step])
  validator.passes()
  return validator
}

const validators = createShallowComputations(formStepShortNames, createFormStepValidator)

/*
 * Errors and validation checks
 */

const shouldValidate = formStepShortNames
  .reduce((acc, step) => (
    { ...acc, [step]: createFormStepObservables(step, false) }
  ), {})

const skippedFormSteps = createShallowObservables(formStepShortNames, () => false)

const getFormStepErrors = step =>
  createFormStepComputations(step, field =>
    shouldValidate[step][field]
      ? validators[step].errors.first(field)
      : ''
  )

const formStepPasses = step =>
  skippedFormSteps[step] || validators[step].passes()

const formStepHasErrors = step =>
  !skippedFormSteps[step] && Object.keys(FormState[step])
    .some(field => shouldValidate[step][field] && validators[step].errors.get(field).length > 0)

const enabledFormSteps = new Set()
const formStepIsAvailable = step => {
  // Once a form step has been enabled once, it makes sense to keep it enabled
  // even if a previous step begins to fail for some reason.
  if (enabledFormSteps.has(step)) {
    return true
  }

  const currentStepIndex = formStepShortNames.indexOf(step)
  for (const stepIndex in [...Array(currentStepIndex).keys()]) {
    if (!ValidationState[formStepShortNames[stepIndex]].passes) {
      return false
    }
  }

  enabledFormSteps.add(step)
  return true
}

/*
 * Defining the MobX store/state object
 */

const ValidationState = observable(
  formStepShortNames.reduce((acc, step) => ({
    ...acc,
    [step]: {
      errors: getFormStepErrors(step),
      passes: computed(() => formStepPasses(step)),
      hasErrors: computed(() => formStepHasErrors(step)),
      beginValidating: action(field => { shouldValidate[step][field] = true }),
      available: computed(() => formStepIsAvailable(step))
    }
  }), {})
)

ValidationState.beginValidatingStep = action(step => {
  for (const field of Object.keys(FormState[step])) {
    shouldValidate[step][field] = true
  }
})

ValidationState.stopValidatingStep = action(step => {
  for (const field of Object.keys(FormState[step])) {
    shouldValidate[step][field] = false
  }
})

ValidationState.skipFormStep = action(step => { skippedFormSteps[step] = true })
ValidationState.removeFormStepSkip = action(step => { skippedFormSteps[step] = false })

export default ValidationState
