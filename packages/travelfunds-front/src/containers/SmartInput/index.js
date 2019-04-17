import React from 'react'
import { inject, observer } from 'mobx-react'

import TextField from '@material-ui/core/TextField'
import MaterialAutosuggest from 'components/MaterialAutosuggest'
import DatePicker from 'material-ui-pickers/DatePicker'

import lang from 'lang/en_US.js'

/*
 * There's a lot of similarities between all of our inputs. They include:
 *   - Setting helperText and error based on a key
 *   - Updating the sidebar title and current field
 *   - onChange & onBlur based on a key
 *
 * This component provides reasonable defaults for those.
 */

export default
@inject('FormState', 'ValidationState') @observer
class extends React.Component {
  updateSidebar () {
    const { FormState, label, field } = this.props
    const tooltip = lang.tooltips[field]
    if (field && label && tooltip) {
      FormState.sidebarTitle = label
      FormState.sidebarContent = tooltip
    }
  }

  onFocus (...args) {
    this.updateSidebar()
    this.props.onFocus && this.props.onFocus(...args)
  }

  onClick (...args) {
    this.updateSidebar()
    this.props.onClick && this.props.onClick(...args)
  }

  onBlur (stepName, fieldName, ...args) {
    this.props.ValidationState[stepName].beginValidating(fieldName)
    this.props.onBlur && this.props.onBlur(...args)
  }

  render () {
    const {
      FormState,
      ValidationState,
      component: Component = TextField,
      field,
      ...rest
    } = this.props

    const stepName = field.split('.')[0]
    const fieldName = field.split('.')[1]

    const onFocus = (...args) => this.onFocus(...args)
    const onClick = (...args) => this.onClick(...args)
    const onBlur = (...args) => this.onBlur(stepName, fieldName, ...args)
    const onChange = ev => { FormState[stepName][fieldName] = ev.target.value }
    const value = FormState[stepName][fieldName] || ''
    const error = !!ValidationState[stepName].errors[fieldName]
    const helperText = ValidationState[stepName].errors[fieldName]

    if (Component === MaterialAutosuggest) {
      return <Component {...{
        ...rest,
        inputProps: {
          ...rest.inputProps,
          onFocus,
          onClick,
          onBlur,
          onChange: (_, { newValue }) => {
            FormState[stepName][fieldName] = newValue
          },
          value
        },
        error,
        helperText
      }} />
    }

    if (Component === DatePicker) {
      return <Component {...{
        ...rest,
        onFocus,
        onBlur,
        onChange: date => onChange({ target: { value: date } }),
        value: value || null,
        error,
        helperText
      }} />
    }

    return <Component {...{
      ...rest,
      onFocus,
      onClick,
      onBlur,
      onChange,
      value,
      error,
      helperText
    }} />
  }
}
