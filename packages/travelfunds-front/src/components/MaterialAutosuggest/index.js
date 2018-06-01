import React from 'react'
import Autosuggest from 'react-autosuggest'
import Paper from '@material-ui/core/Paper'
import FormControl from '@material-ui/core/FormControl'
import TextField from '@material-ui/core/TextField'
import FormHelperText from '@material-ui/core/FormHelperText'
import MenuItem from '@material-ui/core/MenuItem'

import styles from './styles.scss'

// Adapted from https://github.com/mui-org/material-ui/blob/master/docs/src/pages/demos/autocomplete/IntegrationAutosuggest.js

const MaterialAutosuggest = props =>
  <Autosuggest
    theme={{
      ...props.theme,
      container: styles.container,
      suggestionsContainerOpen: styles.suggestionsContainerOpen,
      suggestionsList: styles.suggestionsList
    }}
    renderInputComponent={args =>
      renderInput({
        label: props.label,
        error: props.error,
        helperText: props.helperText,
        ...args })}
    renderSuggestionsContainer={renderSuggestionsContainer}
    renderSuggestion={renderSuggestion}
    {...props}
    inputProps={{
      classes: props.classes,
      ...props.inputProps
    }}
  />

export default MaterialAutosuggest

const renderInput = ({ label, error, helperText, ref, ...rest }) =>
  <FormControl error={error}>
    <TextField
      label={label}
      error={error}
      fullWidth
      InputProps={{
        inputRef: ref,
        ...rest
      }}
    />
    <FormHelperText>{helperText}</FormHelperText>
  </FormControl>

const renderSuggestionsContainer = ({ containerProps, children }) =>
  <Paper {...containerProps} square>
    {children}
  </Paper>

const renderSuggestion = (suggestion, { isHighlighted }) =>
  <MenuItem selected={isHighlighted} component='div'>
    {suggestion.toString()}
  </MenuItem>
