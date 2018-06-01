import React from 'react'
import Select from '@material-ui/core/Select'
import FormControl from '@material-ui/core/FormControl'
import FormHelperText from '@material-ui/core/FormHelperText'
import InputLabel from '@material-ui/core/InputLabel'

// The Material-UI TextField provides label and helperText as props, but the
// Select field requires a different API. This component exposes a Select field
// with the aforementioned props.

export default ({ error, label, helperText, ...rest }) =>
  <FormControl error={error}>
    <InputLabel>{label}</InputLabel>
    <Select {...rest} />
    <FormHelperText>{helperText}</FormHelperText>
  </FormControl>
