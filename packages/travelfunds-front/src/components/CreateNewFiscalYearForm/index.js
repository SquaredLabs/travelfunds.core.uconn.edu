import React from 'react'
import { action, computed, observable } from 'mobx'
import { inject, observer } from 'mobx-react'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import { setup } from 'transport/fiscal-year'

import styles from './styles.scss'

export default
@inject('FiscalYearStore', 'UiState') @observer
class CreateNewFiscalYearForm extends React.Component {
  @observable value = ''

  @computed get validYear () {
    return this.value.length === 4 && Number.isInteger(Number(this.value))
  }

  @action async create () {
    const { FiscalYearStore, UiState } = this.props

    const value = this.value
    this.value = ''

    try {
      await setup(value)
      await FiscalYearStore.fetch()
      UiState.addSnackbarMessage(`Successfully created ${value}`, 'success')
    } catch (err) {
      UiState.addSnackbarMessage(
        'Failed create new fiscal year. It may already exist.',
        'failure'
      )
      console.error(err)
    }
  }

  render () {
    return <form className={styles.container}>
      <p>Don't see a fiscal year that you want to manage? Create it.</p>
      <TextField
        label='Fiscal Year'
        type='number'
        placeholder={String(new Date().getFullYear() + 1)}
        value={this.value}
        onChange={ev => { this.value = ev.target.value }}
        variant='filled'
        InputLabelProps={{
          shrink: true
        }}
      />
      <Button
        className={styles.button}
        disabled={!this.validYear}
        variant='contained'
        color='primary'
        size='large'
        onClick={() => this.create()}>
        Create
      </Button>
    </form>
  }
}
