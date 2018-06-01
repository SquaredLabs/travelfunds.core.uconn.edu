import React from 'react'
import { action } from 'mobx'
import { inject, observer } from 'mobx-react'

import TextField from '@material-ui/core/TextField'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import FormHelperText from '@material-ui/core/FormHelperText'
import Input from '@material-ui/core/Input'
import InputLabel from '@material-ui/core/InputLabel'

import { Accordion, AccordionChild } from 'components/Accordion'
import MaterialAutosuggest from 'components/MaterialAutosuggest'

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
        <MaterialAutosuggest
          suggestions={[...FormState.travelerSuggestions]}
          onSuggestionsFetchRequested={() => FormState.fetchTravelerSuggestions()}
          onSuggestionsClearRequested={() => { FormState.travelerSuggestions = [] }}
          getSuggestionValue={s => s.firstName}
          inputProps={{
            value: FormState.traveler.firstName,
            onChange: (_, { newValue }) => {
              FormState.traveler.firstName = newValue
            },
            onBlur: () => beginValidating('firstName')
          }}
          onSuggestionSelected={(_, { suggestion }) => {
            this.selectTraveler(suggestion)
          }}
          label='First Name'
          error={!!errors.firstName}
          helperText={errors.firstName}
        />
        <MaterialAutosuggest
          suggestions={[...FormState.travelerSuggestions]}
          onSuggestionsFetchRequested={() => FormState.fetchTravelerSuggestions()}
          onSuggestionsClearRequested={() => { FormState.travelerSuggestions = [] }}
          getSuggestionValue={s => s.lastName}
          inputProps={{
            value: FormState.traveler.lastName,
            id: 'lastName',
            name: 'lastName',
            onChange: (_, { newValue }) => {
              FormState.traveler.lastName = newValue
            },
            onBlur: () => beginValidating('lastName')
          }}
          onSuggestionSelected={(_, { suggestion }) => {
            this.selectTraveler(suggestion)
          }}
          label='Last Name'
          error={!!errors.lastName}
          helperText={errors.lastName}
        />
        <TextField
          value={traveler.netid}
          onChange={ev => { traveler.netid = ev.target.value }}
          label='NetID'
          error={!!errors.netid}
          helperText={errors.netid}
          onBlur={() => beginValidating('netid')}
        />
      </div>
      <Accordion className={styles.accordion}>
        { validNetID ? <AccordionChild><RemainingFunds /></AccordionChild> : null }
      </Accordion>
      <TextField
        value={traveler.email}
        onChange={ev => { traveler.email = ev.target.value }}
        label='Email'
        error={!!errors.email}
        helperText={errors.email}
        onBlur={() => beginValidating('email')}
      />
      <FormControl error={!!errors.department}>
        <InputLabel htmlFor='department'>Department</InputLabel>
        <Select
          value={traveler.department}
          onChange={ev => {
            traveler.department = ev.target.value
            beginValidating('department')
          }}
          autoWidth
          input={<Input name='department' id='department' />}
        >
          { departments.map(dept =>
            <MenuItem key={dept} value={dept}>{dept} </MenuItem>) }
        </Select>
        <FormHelperText>{errors.department}</FormHelperText>
      </FormControl>
      <FormControl error={!!errors.title}>
        <InputLabel htmlFor='title'>Title</InputLabel>
        <Select
          value={traveler.title}
          onChange={ev => {
            traveler.title = ev.target.value
            beginValidating('title')
          }}
          autoWidth
          input={<Input name='title' id='title' />}
        >
          { titles.map(title =>
            <MenuItem key={title} value={title}>
              {title}
            </MenuItem>) }
        </Select>
        { errors.title &&
          <FormHelperText>{errors.title}</FormHelperText> }
      </FormControl>
      <SmartInput
        component={TextField}
        sidebarTextId='traveler.yearOfTerminalDegree'
        value={traveler.yearOfTerminalDegree}
        onChange={ev => { traveler.yearOfTerminalDegree = ev.target.value }}
        label='Year of Terminal Degree'
        error={!!errors.yearOfTerminalDegree}
        helperText={errors.yearOfTerminalDegree}
        onBlur={() => beginValidating('yearOfTerminalDegree')}
      />
      <BackNextButtons />
    </div>
  }
}
