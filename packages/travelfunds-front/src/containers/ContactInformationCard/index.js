import React from 'react'
import { action } from 'mobx'
import { inject, observer } from 'mobx-react'
import * as Cookies from 'js-cookie'

import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'

import { Accordion, AccordionChild } from 'components/Accordion'
import BackNextButtons from 'containers/BackNextButtons'

import lang from 'lang/en_US'
import { ContactOptions } from 'config'

import styles from './styles.scss'

@inject('FormState', 'ValidationState') @observer
export default class extends React.Component {
  @action selectContact (netid) {
    const { FormState } = this.props
    FormState.contact.netid = netid || ''
  }

  @action selectFaculty (netid) {
    const { FormState } = this.props
    // Fetch and fill may fail. In that case, we still fill in what we do have
    FormState.traveler.netid = netid || ''
  }

  @action chooseContactOption (contactOption) {
    const { FormState } = this.props
    const currentUser = Cookies.get('user')

    if (contactOption === ContactOptions.MYSELF) {
      FormState.contactOption = ContactOptions.MYSELF
      this.selectFaculty(currentUser)
    } else if (contactOption === ContactOptions.OTHER) {
      FormState.contactOption = ContactOptions.OTHER
      this.selectContact(currentUser)
    }
  }

  renderMyselfPanel () {
    return <AccordionChild key='myself'>
      <p>{lang.askForOptionalContact}</p>
      { this.renderContactFields() }
      <BackNextButtons />
    </AccordionChild>
  }

  renderOtherPanel () {
    return <AccordionChild key='other'>
      <p>{lang.askForInformationAboutContact}</p>
      { this.renderContactFields() }
      <BackNextButtons />
    </AccordionChild>
  }

  renderContactFields () {
    const { FormState, ValidationState } = this.props
    const { contact } = FormState
    const { contact: { errors, beginValidating } } = ValidationState

    return <div>
      <br />
      <TextField
        label='NetID'
        value={contact.netid}
        onChange={ev => { contact.netid = ev.target.value }}
        error={!!errors.netid}
        helperText={errors.netid}
        onBlur={() => beginValidating('netid')}
      />
      <br />
      <TextField
        label='Email Address'
        value={contact.email}
        onChange={ev => { contact.email = ev.target.value }}
        error={!!errors.email}
        helperText={errors.email}
        onBlur={() => beginValidating('email')}
      />
      <br />
      <TextField
        label='Phone Number'
        value={contact.phoneNumber}
        onChange={ev => { contact.phoneNumber = ev.target.value }}
        error={!!errors.phoneNumber}
        helperText={errors.phoneNumber}
        onBlur={() => beginValidating('phoneNumber')}
      />
    </div>
  }

  render () {
    const { FormState } = this.props
    return <div>
      { lang.welcome.map((msg, i) => <p key={i}>{msg}</p>) }

      <div className={styles.willThereBeAContactButtons}>
        <Button
          className={styles.button}
          variant='raised'
          color='secondary'
          onClick={() => { this.chooseContactOption(ContactOptions.OTHER) }}
          children={ContactOptions.OTHER}
        />
        <Button
          className={styles.button}
          variant='raised'
          color='primary'
          onClick={() => { this.chooseContactOption(ContactOptions.MYSELF) }}
          children={ContactOptions.MYSELF}
        />
      </div>

      <Accordion className={styles.accordion}>
        { FormState.contactOption && (FormState.contactOption === ContactOptions.MYSELF
          ? this.renderMyselfPanel()
          : this.renderOtherPanel()
        )}
      </Accordion>

    </div>
  }
}
