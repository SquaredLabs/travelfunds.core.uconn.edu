import React from 'react'
import { action } from 'mobx'
import { inject, observer } from 'mobx-react'

import AutoComplete from 'material-ui/AutoComplete'
import TextField from 'material-ui/TextField'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'

import { Accordion, AccordionChild } from 'components/Accordion'

import SmartInput from 'containers/SmartInput'
import BackNextButtons from 'containers/BackNextButtons'
import RemainingFunds from 'containers/RemainingFunds'

import { titles, departments } from 'config'

import styles from './styles.scss'

@inject('FormState', 'ValidationState') @observer
export default class extends React.Component {
  @action selectTraveler (suggestion) {
    const { FormState } = this.props
    FormState.traveler.netid = suggestion.netid
    FormState.traveler.firstName = suggestion.firstName
    FormState.traveler.lastName = suggestion.lastName
  }

  render () {
    const { FormState, ValidationState } = this.props
    const { traveler } = FormState
    const { traveler: { errors, beginValidating } } = ValidationState

    const validNetID = !ValidationState.traveler.errors.netid && FormState.traveler.netid !== ''

    return <div className={styles.container}>
      <div className={styles.identityFields}>
        <AutoComplete
          className={styles.nameAutoComplete}
          floatingLabelText='First Name'
          filter={AutoComplete.caseInsensitiveFilter}
          searchText={FormState.traveler.firstName}
          dataSource={FormState.travelerSuggestions.map(s => s.toString())}
          onUpdateInput={val => { FormState.traveler.firstName = val }}
          onNewRequest={(_, i) => this.selectTraveler(FormState.travelerSuggestions[i])}
          errorText={errors.firstName}
          onBlur={() => beginValidating('firstName')}
        />
        <AutoComplete
          className={styles.nameAutoComplete}
          floatingLabelText='Last Name'
          filter={AutoComplete.caseInsensitiveFilter}
          searchText={FormState.traveler.lastName}
          dataSource={FormState.travelerSuggestions.map(s => s.toString())}
          onUpdateInput={val => { FormState.traveler.lastName = val }}
          onNewRequest={(_, i) => this.selectTraveler(FormState.travelerSuggestions[i])}
          errorText={errors.lastName}
          onBlur={() => beginValidating('lastName')}
        />
        <TextField
          value={traveler.netid}
          onChange={ev => { traveler.netid = ev.target.value }}
          floatingLabelText='NetID'
          errorText={errors.netid}
          onBlur={() => beginValidating('netid')}
        />
      </div>
      <Accordion className={styles.accordion}>
        { validNetID ? <AccordionChild><RemainingFunds /></AccordionChild> : null }
      </Accordion>
      <TextField
        value={traveler.email}
        onChange={ev => { traveler.email = ev.target.value }}
        floatingLabelText='Email'
        errorText={errors.email}
        onBlur={() => beginValidating('email')}
      />
      <SelectField
        value={traveler.department}
        onChange={(ev, index, val) => {
          traveler.department = val
          beginValidating('department')
        }}
        maxHeight={300}
        autoWidth
        floatingLabelText='Department'
        errorText={errors.department}
      >
        { departments.map(dept => <MenuItem key={dept} value={dept} primaryText={dept} />) }
      </SelectField>
      <SelectField
        value={traveler.title}
        onChange={(ev, index, val) => {
          traveler.title = val
          beginValidating('title')
        }}
        maxHeight={300}
        autoWidth
        floatingLabelText='Title'
        errorText={errors.title}
      >
        { titles.map(title => <MenuItem key={title} value={title} primaryText={title} />) }
      </SelectField>
      <SmartInput
        component={TextField}
        sidebarTextId='traveler.yearOfTerminalDegree'
        value={traveler.yearOfTerminalDegree}
        onChange={ev => { traveler.yearOfTerminalDegree = ev.target.value }}
        floatingLabelText='Year of Terminal Degree'
        errorText={errors.yearOfTerminalDegree}
        onBlur={() => beginValidating('yearOfTerminalDegree')}
      />
      <BackNextButtons />
    </div>
  }
}
