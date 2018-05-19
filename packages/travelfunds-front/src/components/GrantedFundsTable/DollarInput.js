import React from 'react'
import Fraction from 'fraction.js'

/*
 * DollarInput is a component that expects values as a Fraction object (from
 * fraction.js on npm). Internally, the current user input is stored as a string
 * formatted as a nice decimal.
 */
export default class extends React.Component {
  normalizeInput = value => {
    if (!value.includes('.')) {
      value += '.00'
    } else if (/\.$/.test(value)) {
      value += '00'
    } else if (/\.\d$/.test(value)) {
      value += '0'
    } else if (value.trim() === '') {
      value = '0'
    }
    return value
  }

  state = { value: this.normalizeInput(String(this.props.value)) }

  componentWillReceiveProps (nextProps) {
    const newValueWillNotDisturbUser = this.input !== document.activeElement
    if (newValueWillNotDisturbUser) {
      this.setState({ value: this.normalizeInput(String(nextProps.value)) })
    }
  }

  updateValueWithOnlyDigits = ev => {
    const matchDollars = /(\d+(\.\d{0,2})?)/g
    const onlyDigitsAndDecimal = ev.target.value.replace(/[^\d|.]/g, '')
    const matches = matchDollars.exec(onlyDigitsAndDecimal)
    const value = matches === null ? '' : matches[1]
    this.setState({ value })
  }

  onBlur = ev => {
    const value = this.normalizeInput(ev.target.value)
    this.setState({ value })
    this.props.onChange(Fraction(value))
  }

  render () {
    return <input
      {...this.props}
      ref={ref => { this.input = ref }}
      type='text'
      value={this.state.value}
      onChange={this.updateValueWithOnlyDigits}
      onBlur={this.onBlur}
    />
  }
}
