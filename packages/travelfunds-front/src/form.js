import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'mobx-react'
import Raven from 'raven-js'

import UiState from 'stores/UiState'
import FormState from 'stores/FormState'
import ValidationState from 'stores/ValidationState'
import TransportState from 'stores/TransportState'

import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import blue from '@material-ui/core/colors/blue'

import Container from './Container'

import ReactGA from 'react-ga'

if (process.env.GOOGLE_ANALYTICS_TRACKING_ID) {
  // Google Analytics tracking ID
  ReactGA.initialize(process.env.GOOGLE_ANALYTICS_TRACKING_ID)
  // This just needs to be called once since we have no routes in a single
  // page application
  ReactGA.pageview(window.location.pathname)
}

// Send errors to Sentry.
if (process.env.NODE_ENV === 'production') {
  Raven.config(process.env.SENTRY_DSN_FRONTEND).install()
}

const muiTheme = createMuiTheme({
  palette: {
    primary: blue
  }
})

const stores = { UiState, FormState, ValidationState, TransportState }

const App = () => (
  <Provider {...stores}>
    <MuiThemeProvider theme={muiTheme}>
      <Container />
    </MuiThemeProvider>
  </Provider>
)

const root = document.createElement('div')
document.body.append(root)
ReactDOM.render(<App />, root)
