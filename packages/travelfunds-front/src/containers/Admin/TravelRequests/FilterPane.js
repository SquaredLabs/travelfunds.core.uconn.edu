import React from 'react'
import Drawer from '@material-ui/core/Drawer'
import Input from '@material-ui/core/Input'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import Checkbox from '@material-ui/core/Checkbox'
import ListItemText from '@material-ui/core/ListItemText'

import styles from './styles.scss'

export default ({ filters, filterOptions, onFilterChange, ...rest }) =>
  <Drawer anchor='right' {...rest}>
    <div className={styles.filterPane}>
      {Object.keys(filters).map(label =>
        <FormControl key={label}>
          <InputLabel htmlFor={label}>{label}</InputLabel>
          <Select
            multiple
            value={[...filters[label]]}
            onChange={ev => onFilterChange({
              ...filters,
              [label]: ev.target.value
            })}
            input={<Input id={label} />}
            renderValue={selected => selected.join(', ')}
          >
            {Object.values(filterOptions[label]).sort().map(option => (
              <MenuItem key={option} value={option}>
                <Checkbox checked={filters[label].indexOf(option) !== -1} />
                <ListItemText primary={option} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>)}
    </div>
  </Drawer>
