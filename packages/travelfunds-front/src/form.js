import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'mobx-react'
import Raven from 'raven-js'

import UiState from 'stores/UiState'
import FormState from 'stores/FormState'
import ValidationState from 'stores/ValidationState'
import TransportState from 'stores/TransportState'

import injectTapEventPlugin from 'react-tap-event-plugin'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import { blue500 } from 'material-ui/styles/colors'

import Container from './Container'

import ReactGA from 'react-ga'

// Google Analytics tracking ID
ReactGA.initialize(process.env.GOOGLE_ANALYTICS_TRACKING_ID)
// This just needs to be called once since we have no routes in a single page application
ReactGA.pageview(window.location.pathname)

// Send errors to Sentry.
if (process.env.NODE_ENV === 'production') {
  Raven.config(process.env.SENTRY_DSN_FRONTEND).install()
}

// Needed by Material-UI. Will be removed in future version of MUI.
injectTapEventPlugin()

const muiTheme = getMuiTheme({
  palette: {
    primary1Color: blue500
  }
})

const stores = { UiState, FormState, ValidationState, TransportState }

const App = () => (
  <Provider {...stores}>
    <MuiThemeProvider muiTheme={muiTheme}>
      <Container />
    </MuiThemeProvider>
  </Provider>
)

const root = document.createElement('div')
document.body.append(root)
ReactDOM.render(<App />, root)
