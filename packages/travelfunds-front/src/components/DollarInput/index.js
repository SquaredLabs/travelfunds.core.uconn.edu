import React from 'react'
import ca from 'classnames'
import TextField from 'material-ui/TextField'
import styles from './styles.scss'

/*
 * The <TextField> from material-ui does not support current numbers well.
 * We'll compose it here to fit it to our purposes.
 */

export default class extends React.Component {
  onChange (ev) {
    if (ev.target.value === '.') {
      ev.target.value = '0.'
      this.props.onChange(ev)
    }

    const matchDollars = /\d+(\.\d{0,2})?/g
    const matches = matchDollars.exec(ev.target.value)

    ev.target.value = matches === null
      ? ''
      : matches[0]

    this.props.onChange(ev)
  }

  render () {
    const { className, value, ...rest } = this.props

    return <TextField
      {...rest}
      step={0.01}
      value={value === '' ? '' : '$' + value}
      className={ca(styles.textField, className)}
      hintText='$ 0.00'
      onChange={ev => this.onChange(ev)}
    />
  }
}
