import React from 'react'
import { action } from 'mobx'
import { inject, observer } from 'mobx-react'
import * as Cookies from 'js-cookie'

import AutoComplete from 'material-ui/AutoComplete'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'

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
    FormState.fetchAndFillContactDetails(netid)
  }

  @action selectFaculty (netid) {
    const { FormState } = this.props
    // Fetch and fill may fail. In that case, we still fill in what we do have
    FormState.traveler.netid = netid || ''
    FormState.fetchAndFillTravelerDetails(netid)
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
      <AutoComplete
        floatingLabelText={FormState.contactOption === ContactOptions.OTHER
          ? 'Your Name'
          : 'Administrative Contact Name'}
        filter={AutoComplete.caseInsensitiveFilter}
        searchText={FormState.contact.name}
        dataSource={FormState.contactSuggestions.map(s => s.toString())}
        onUpdateInput={val => { FormState.contact.name = val }}
        onNewRequest={(_, i) => this.selectContact(FormState.contactSuggestions[i])}
        errorText={errors.name}
        onBlur={() => beginValidating('name')}
      />
      <br />
      <TextField
        floatingLabelText='NetID'
        value={contact.netid}
        onChange={ev => { contact.netid = ev.target.value }}
        errorText={errors.netid}
        onBlur={() => beginValidating('netid')}
      />
      <br />
      <TextField
        floatingLabelText='Email Address'
        value={contact.email}
        onChange={ev => { contact.email = ev.target.value }}
        errorText={errors.email}
        onBlur={() => beginValidating('email')}
      />
      <br />
      <TextField
        floatingLabelText='Phone Number'
        value={contact.phoneNumber}
        onChange={ev => { contact.phoneNumber = ev.target.value }}
        errorText={errors.phoneNumber}
        onBlur={() => beginValidating('phoneNumber')}
      />
    </div>
  }

  render () {
    const { FormState } = this.props
    return <div>
      { lang.welcome.map((msg, i) => <p key={i}>{msg}</p>) }

      <div className={styles.willThereBeAContactButtons}>
        <RaisedButton
          className={styles.button}
          label={ContactOptions.OTHER}
          secondary
          onTouchTap={() => { this.chooseContactOption(ContactOptions.OTHER) }}
        />
        <RaisedButton
          className={styles.button}
          label={ContactOptions.MYSELF}
          primary
          onTouchTap={() => { this.chooseContactOption(ContactOptions.MYSELF) }}
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
