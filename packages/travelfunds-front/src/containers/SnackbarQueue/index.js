import React from 'react'
import { observer, inject } from 'mobx-react'
import { withStyles } from '@material-ui/core/styles'
import Icon from '@material-ui/core/Icon'
import IconButton from '@material-ui/core/IconButton'
import Snackbar from '@material-ui/core/Snackbar'

const styles = theme => ({
  message: {
    display: 'flex',
    alignItems: 'center'
  },
  icon: {
    marginRight: '0.5em'
  },
  close: {
    width: theme.spacing(4),
    height: theme.spacing(4)
  }
})

@inject('UiState') @observer
class SnackbarQueue extends React.Component {
  render () {
    const { classes, UiState } = this.props
    return <Snackbar
      open={UiState.snackbarOpen}
      autoHideDuration={3000}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'center'
      }}
      onClose={() => { UiState.snackbarOpen = false }}
      onExited={() => UiState.processSnackbarQueue()}
      key={UiState.snackbarQueue.length > 0 ? UiState.snackbarQueue[0].key : undefined}
      message={UiState.snackbarQueue.length > 0
        ? (
          <span className={classes.message}>
            { UiState.snackbarQueue[0].type &&
              <Icon className={classes.icon}>
                { UiState.snackbarQueue[0].type === 'success' && 'check_circle' }
                { UiState.snackbarQueue[0].type === 'failure' && 'error' }
                { UiState.snackbarQueue[0].type === 'info' && 'info' }
              </Icon> }
            {UiState.snackbarQueue[0].message}
          </span>
        )
        : ''}
      action={
        <IconButton
          className={classes.close}
          onClick={() => { UiState.snackbarOpen = false }}
          color='secondary'>
          <Icon>close</Icon>
        </IconButton>
      }
    />
  }
}

export default withStyles(styles, { withTheme: true })(SnackbarQueue)
