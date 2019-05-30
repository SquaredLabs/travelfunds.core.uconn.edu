import React from 'react'
import { action } from 'mobx'
import { inject, observer } from 'mobx-react'

import Select from 'components/FormControlSelect'
import MenuItem from '@material-ui/core/MenuItem'

import { Accordion, AccordionChild } from 'components/Accordion'
import MaterialAutosuggest from 'components/MaterialAutosuggest'

import SmartInput from 'containers/SmartInput'
import BackNextButtons from 'containers/BackNextButtons'
import RemainingFunds from 'containers/RemainingFunds'

import { titles, departments } from 'config'

import styles from './styles.scss'

export default
@inject('FormState', 'ValidationState') @observer
class extends React.Component {
  @action selectTraveler (suggestion) {
    const { FormState } = this.props
    FormState.traveler.netid = suggestion.netid
    FormState.traveler.firstName = suggestion.firstName
    FormState.traveler.lastName = suggestion.lastName
  }

  render () {
    const { FormState, ValidationState } = this.props

    const validNetID = !ValidationState.traveler.errors.netid && FormState.traveler.netid.length === 8

    return <div className={styles.container}>
      <div className={styles.identityFields}>
        <SmartInput
          component={MaterialAutosuggest}
          label='First Name'
          field='traveler.firstName'
          suggestions={[...FormState.travelerSuggestions]}
          onSuggestionsFetchRequested={() => FormState.fetchTravelerSuggestions()}
          onSuggestionsClearRequested={() => { FormState.travelerSuggestions = [] }}
          getSuggestionValue={s => s.firstName}
          onSuggestionSelected={(_, { suggestion }) => {
            this.selectTraveler(suggestion)
          }}
        />
        <SmartInput
          component={MaterialAutosuggest}
          label='Last Name'
          field='traveler.lastName'
          suggestions={[...FormState.travelerSuggestions]}
          onSuggestionsFetchRequested={() => FormState.fetchTravelerSuggestions()}
          onSuggestionsClearRequested={() => { FormState.travelerSuggestions = [] }}
          getSuggestionValue={s => s.lastName}
          onSuggestionSelected={(_, { suggestion }) => {
            this.selectTraveler(suggestion)
          }}
        />
        <SmartInput label='NetID' field='traveler.netid' />
      </div>
      <Accordion className={styles.accordion}>
        { validNetID ? <AccordionChild><RemainingFunds /></AccordionChild> : null }
      </Accordion>
      <SmartInput label='Email' field='traveler.email' />
      <SmartInput component={Select} label='Department' field='traveler.department'>
        { departments.map(dept =>
          <MenuItem key={dept} value={dept}>{dept} </MenuItem>) }
      </SmartInput>
      <SmartInput component={Select} label='Title' field='traveler.title'>
        { titles.map(title =>
          <MenuItem key={title} value={title}>
            {title}
          </MenuItem>) }
      </SmartInput>
      <SmartInput
        label='Year of Terminal Degree'
        field='traveler.yearOfTerminalDegree'
      />
      <BackNextButtons />
    </div>
  }
}
