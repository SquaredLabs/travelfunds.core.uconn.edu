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

export default ({
  filterableProperties,
  propertyNameDisplay,
  filters,
  filterOptions,
  onFilterChange,
  ...rest
}) =>
  <Drawer anchor='right' {...rest}>
    <div className={styles.filterPane}>
      {filterableProperties.map(id =>
        <FormControl key={id}>
          <InputLabel htmlFor={id}>
            {propertyNameDisplay ? propertyNameDisplay(id) : id}
          </InputLabel>
          <Select
            multiple
            value={[...filters[id]]}
            onChange={ev => onFilterChange({
              ...filters,
              [id]: ev.target.value
            })}
            input={<Input id={id} />}
            renderValue={selected => selected.join(', ')}
          >
            {Object.values(filterOptions[id]).sort().map(option => (
              <MenuItem key={option} value={option}>
                <Checkbox checked={filters[id].indexOf(option) !== -1} />
                <ListItemText primary={option} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>)}
    </div>
  </Drawer>
