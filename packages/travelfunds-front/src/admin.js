import React from 'react'
import ReactDOM from 'react-dom'
import GrantedFundsTable from 'components/GrantedFundsTable'

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import injectTapEventPlugin from 'react-tap-event-plugin'

// Needed by Material-UI. Will be removed in future version of MUI.
injectTapEventPlugin()

const App = () =>
  <MuiThemeProvider>
    <GrantedFundsTable {...window.editRequestedFunds} />
  </MuiThemeProvider>

ReactDOM.render(<App />, document.getElementById('grant-costs-control'))
